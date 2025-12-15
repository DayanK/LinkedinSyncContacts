import { PrismaClient } from '@prisma/client';
import { ContactInput } from '../types';

const prisma = new PrismaClient();

export class ContactService {
  // Sync contacts from extension
  static async syncContacts(userId: string, contacts: ContactInput[]) {
    let added = 0;
    let updated = 0;

    for (const contact of contacts) {
      const existing = await prisma.contact.findUnique({
        where: {
          userId_linkedInId: {
            userId,
            linkedInId: contact.linkedInId,
          },
        },
      });

      if (existing) {
        // Update existing contact
        await prisma.contact.update({
          where: { id: existing.id },
          data: {
            name: contact.name,
            title: contact.title,
            company: contact.company,
            location: contact.location,
            avatar: contact.avatar,
            profileUrl: contact.profileUrl,
            scrapedAt: new Date(contact.scrapedAt),
          },
        });
        updated++;
      } else {
        // Create new contact
        await prisma.contact.create({
          data: {
            userId,
            linkedInId: contact.linkedInId,
            name: contact.name,
            title: contact.title,
            company: contact.company,
            location: contact.location,
            avatar: contact.avatar,
            profileUrl: contact.profileUrl,
            scrapedAt: new Date(contact.scrapedAt),
          },
        });
        added++;
      }
    }

    // Create sync session record
    await prisma.syncSession.create({
      data: {
        userId,
        contactsAdded: added,
        contactsUpdated: updated,
        source: 'extension',
        status: 'success',
      },
    });

    return { added, updated, total: contacts.length };
  }

  // Get all contacts for user
  static async getContacts(userId: string, search?: string) {
    const where: any = { userId };

    // SQLite doesn't support case-insensitive search with mode: 'insensitive'
    // So we fetch all and filter in JavaScript
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (search) {
      const searchLower = search.toLowerCase();
      return contacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.title?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower)
      );
    }

    return contacts;
  }

  // Get single contact
  static async getContact(userId: string, contactId: string) {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  }

  // Update contact (add notes, tags, etc.)
  static async updateContact(
    userId: string,
    contactId: string,
    data: { notes?: string; tags?: string; email?: string; phone?: string }
  ) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return await prisma.contact.update({
      where: { id: contactId },
      data,
    });
  }

  // Delete contact
  static async deleteContact(userId: string, contactId: string) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });
  }

  // Get sync history
  static async getSyncHistory(userId: string) {
    return await prisma.syncSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // Get statistics
  static async getStats(userId: string) {
    const totalContacts = await prisma.contact.count({
      where: { userId },
    });

    const lastSync = await prisma.syncSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalContacts,
      lastSync: lastSync?.createdAt,
    };
  }
}
