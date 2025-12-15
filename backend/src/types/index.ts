import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Contact from extension
export interface ContactInput {
  linkedInId: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  avatar?: string;
  profileUrl: string;
  scrapedAt: string;
}

// User registration
export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// User login
export interface LoginInput {
  email: string;
  password: string;
}
