import { Router } from 'express';
import { z } from 'zod';
import { ContactService } from '../services/contactService';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schema for contact sync
const contactSchema = z.object({
  linkedInId: z.string(),
  name: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
  profileUrl: z.string(),
  scrapedAt: z.string(),
});

const syncSchema = z.object({
  contacts: z.array(contactSchema),
});

// POST /api/contacts/sync
router.post('/sync', async (req: AuthRequest, res) => {
  try {
    console.log('📥 Sync request received from user:', req.user!.id);
    console.log('📦 Contacts payload:', JSON.stringify(req.body, null, 2));

    const { contacts } = syncSchema.parse(req.body);
    console.log('✅ Validation passed, syncing', contacts.length, 'contacts');

    const result = await ContactService.syncContacts(req.user!.id, contacts);
    console.log('✅ Sync complete:', result);

    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors);
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('❌ Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/contacts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const search = req.query.search as string | undefined;
    const contacts = await ContactService.getContacts(req.user!.id, search);
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const contact = await ContactService.getContact(req.user!.id, req.params.id);
    res.json(contact);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// PATCH /api/contacts/:id
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      notes: z.string().optional(),
      tags: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    });

    const data = updateSchema.parse(req.body);
    const contact = await ContactService.updateContact(req.user!.id, req.params.id, data);
    res.json(contact);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(404).json({ error: error.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await ContactService.deleteContact(req.user!.id, req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/contacts/sync/history
router.get('/sync/history', async (req: AuthRequest, res) => {
  try {
    const history = await ContactService.getSyncHistory(req.user!.id);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/contacts/stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const stats = await ContactService.getStats(req.user!.id);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
