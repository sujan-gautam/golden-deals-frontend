
import { Types } from 'mongoose';

export interface BasePost {
  _id?: string | Types.ObjectId;
  userId: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: string[]; // array of user IDs who liked the post
  comments: number;
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
}

export type Post = BasePost | ProductPost | EventPost;
