import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Store for OAuth state (in production, use Redis)
const oauthStates = new Map<string, { timestamp: number }>();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(data);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data);
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(401).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await AuthService.getCurrentUser(req.user!.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// POST /api/auth/set-password - Add password to OAuth account
const setPasswordSchema = z.object({
  password: z.string().min(6),
});

router.post('/set-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { password } = setPasswordSchema.parse(req.body);

    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password set successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn OAuth Routes
// GET /api/auth/linkedin
router.get('/linkedin', async (req, res) => {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    oauthStates.set(state, { timestamp: Date.now() });

    // Clean up old states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of oauthStates.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        oauthStates.delete(key);
      }
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      redirect_uri: process.env.LINKEDIN_CALLBACK_URL || '',
      state: state,
      scope: 'openid profile email',
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    res.redirect(authUrl);
  } catch (error: any) {
    console.error('LinkedIn OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate LinkedIn OAuth', details: error.message });
  }
});

// GET /api/auth/linkedin/callback
router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    // Check if user denied access
    if (oauthError) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=access_denied`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Verify state to prevent CSRF
    if (!oauthStates.has(state as string)) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Clean up used state
    oauthStates.delete(state as string);

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL || '',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from LinkedIn
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userInfoResponse.data;

    // Find or create user
    const email = userInfo.email;
    if (!email) {
      return res.status(400).json({ error: 'No email found in LinkedIn profile' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: userInfo.given_name || '',
          lastName: userInfo.family_name || '',
          password: '', // OAuth users don't need a password
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log('✅ LinkedIn OAuth successful!');
    console.log('📧 User:', email);
    console.log('🔑 Token:', token);
    console.log('Copy this command to connect your extension:');
    console.log(`chrome.storage.local.set({auth_token: '${token}', user: {email: '${email}'}}, () => location.reload());`);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error: any) {
    console.error('LinkedIn OAuth callback error:', error);
    console.error('Error details:', error.response?.data);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

export default router;
