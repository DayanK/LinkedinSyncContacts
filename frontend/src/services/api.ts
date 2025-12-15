import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Contact {
  id: string;
  linkedInId: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  avatar?: string;
  profileUrl: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Contacts API
export const contactsAPI = {
  sync: async (contacts: any[]): Promise<{ added: number; updated: number; total: number }> => {
    const response = await api.post('/contacts/sync', { contacts });
    return response.data;
  },

  getAll: async (search?: string): Promise<Contact[]> => {
    const response = await api.get<Contact[]>('/contacts', {
      params: { search },
    });
    return response.data;
  },

  getOne: async (id: string): Promise<Contact> => {
    const response = await api.get<Contact>(`/contacts/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.patch<Contact>(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },

  getStats: async (): Promise<{ totalContacts: number; lastSync?: string }> => {
    const response = await api.get('/contacts/stats');
    return response.data;
  },
};
