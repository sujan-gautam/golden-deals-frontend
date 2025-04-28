// src/types/user.ts
import { Types } from 'mongoose';

export interface User {
  _id: string | Types.ObjectId; // Keep _id for backend compatibility
  username: string;
  firstname?: string; // Optional, used by use-auth.ts
  lastname?: string; // Optional, used by use-auth.ts
  name?: string; // Optional, for compatibility with backend
  email: string;
  password?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  bio?: string;
  location?: string;
  website?: string;
}