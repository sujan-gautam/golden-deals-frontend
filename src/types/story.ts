// @/types/story.ts
import { Types } from 'mongoose';

export interface StoryUser {
  _id: string | Types.ObjectId;
  name?: string; // Optional since it’s not always present
  username?: string;
  avatar?: string | null;
}

export interface StoryImage {
  filename: string;
  path: string;
  mimetype: string;
}

export interface Story {
  _id?: string | Types.ObjectId;
  user_id: StoryUser; // Changed to match backend field name and structure
  image: StoryImage | string;
  text?: string;
  textColor?: string;
  createdAt: string | Date;
  views?: number;
  duration?: number;
  expiresAt?: string | Date;
  location?: string;
  isViewed?: boolean;
  __v?: number;
}