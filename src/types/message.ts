
import { Types } from 'mongoose';

export interface Message {
  _id?: string | Types.ObjectId;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id?: string | Types.ObjectId;
  participants: {
    _id: string;
    name: string;
    avatar: string;
  }[];
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}
