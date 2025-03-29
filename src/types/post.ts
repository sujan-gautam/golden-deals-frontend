
import { Types } from 'mongoose';

export interface BasePost {
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  user: {
    _id: string | Types.ObjectId;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: (string | Types.ObjectId)[]; // array of user IDs who liked the post
  comments: number;
  shares: number; // number of times the post was shared
  createdAt: string;
  type: string;
}

export interface ProductPost extends BasePost {
  type: 'product';
  productName: string;
  price: string;
  category?: string;
  condition?: string;
  status: 'instock' | 'lowstock' | 'soldout';
}

export interface EventPost extends BasePost {
  type: 'event';
  title: string;
  date: string;
  location: string;
  interested: (string | Types.ObjectId)[]; // array of user IDs who are interested in the event
}

export type Post = BasePost | ProductPost | EventPost;

// Helper function to convert ObjectId to string safely
export const idToString = (id: string | Types.ObjectId | undefined): string => {
  if (!id) return '';
  return typeof id === 'string' ? id : id.toString();
};
