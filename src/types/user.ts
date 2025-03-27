
import { Types } from 'mongoose';

export interface User {
  _id?: string | Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
}
