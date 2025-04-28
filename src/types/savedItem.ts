import { Post, ProductPost, EventPost } from './post';
import { User } from './user';

export interface SavedItem {
  _id: string;
  user_id: string | User;
  item_type: 'post' | 'product' | 'event';
  item_id: Post | ProductPost | EventPost;
  createdAt: string;
}