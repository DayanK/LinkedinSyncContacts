import { useState, useEffect } from 'react';
import { chromeStorageService } from '../services/chromeStorage';
import type { Contact } from '../types/contact';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les contacts au démarrage
    loadContacts();

    // Écouter les changements
    const unsubscribe = chromeStorageService.onChange((newContacts) => {
      setContacts(newContacts);
    });

    return unsubscribe;
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const data = await chromeStorageService.getContacts();
    setContacts(data);
    setLoading(false);
  };

  const clearContacts = async () => {
    await chromeStorageService.clearContacts();
    setContacts([]);
  };

  return {
    contacts,
    loading,
    clearContacts,
    refresh: loadContacts,
  };
}
