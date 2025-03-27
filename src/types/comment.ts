
import { Types } from 'mongoose';

export interface Comment {
  _id?: string | Types.ObjectId;
  postId: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: string[]; // array of user IDs who liked the comment
}
