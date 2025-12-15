import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function configurePassport() {
  // LinkedIn OpenID Connect Strategy
  passport.use(
    'linkedin',
    new OpenIDConnectStrategy(
      {
        issuer: 'https://www.linkedin.com/oauth',
        authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
        userInfoURL: 'https://api.linkedin.com/v2/userinfo',
        clientID: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        callbackURL: process.env.LINKEDIN_CALLBACK_URL || '',
        scope: ['openid', 'profile', 'email'],
      },
      async (
        issuer: any,
        profile: any,
        context: any,
        idToken: any,
        accessToken: any,
        refreshToken: any,
        done: any
      ) => {
        try {
          const email = profile.emails?.[0]?.value || profile.email;

          if (!email) {
            return done(new Error('No email found in LinkedIn profile'));
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Create new user from LinkedIn profile
            user = await prisma.user.create({
              data: {
                email,
                firstName: profile.name?.givenName || profile.given_name,
                lastName: profile.name?.familyName || profile.family_name,
                password: '', // No password for OAuth users
              },
            });
          }

          // Generate JWT token
          const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d',
          });

          return done(null, { user, token });
        } catch (error) {
          console.error('LinkedIn OAuth error:', error);
          return done(error);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
}
