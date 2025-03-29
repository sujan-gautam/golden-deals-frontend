
import { Types } from 'mongoose';
import { User } from './user';

export interface Comment {
  _id: string | Types.ObjectId;
  postId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  content: string;
  likes: (string | Types.ObjectId)[];
  parentId?: string | Types.ObjectId | null;
  createdAt: string;
  user?: User;
  replies?: Comment[];
}
