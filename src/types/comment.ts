
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

export interface CommentDisplay {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  liked: boolean;
  createdAt: string;
  replies?: CommentDisplay[];
}
