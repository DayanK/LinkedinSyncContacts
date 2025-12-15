import type { Contact } from '../types/contact';

// Vérifier si on est dans un contexte Chrome Extension
const isExtensionContext = typeof chrome !== 'undefined' && chrome.storage;

export const chromeStorageService = {
  // Récupérer tous les contacts
  getContacts: async (): Promise<Contact[]> => {
    if (!isExtensionContext) {
      console.warn('Chrome Storage API not available');
      return [];
    }

    return new Promise((resolve) => {
      chrome.storage.local.get(['contacts'], (result: { contacts?: Contact[] }) => {
        resolve(result.contacts || []);
      });
    });
  },

  // Sauvegarder des contacts
  saveContacts: async (contacts: Contact[]): Promise<void> => {
    if (!isExtensionContext) {
      console.warn('Chrome Storage API not available');
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ contacts }, () => {
        resolve();
      });
    });
  },

  // Effacer tous les contacts
  clearContacts: async (): Promise<void> => {
    if (!isExtensionContext) {
      console.warn('Chrome Storage API not available');
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.local.set({ contacts: [] }, () => {
        resolve();
      });
    });
  },

  // Écouter les changements
  onChange: (callback: (contacts: Contact[]) => void) => {
    if (!isExtensionContext) {
      return () => {};
    }

    const listener = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.contacts) {
        callback(changes.contacts.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Retourner une fonction de nettoyage
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  },
};
