export interface User {
  _id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message; 
  unreadCount?: number; 
}

export interface Message {
  _id: string;
  conversationId: string;
  sender?: User;
  senderId?: string | User;
  receiver?: string; 
  content: string;
  product?: {
    _id: string;
    title: string;
    price: number | null;
    image: string | null;
    condition: string | null;
    category: string | null;
  } | null;
  isAIResponse?: boolean; 
  isRead?: boolean; 
  createdAt: string;
}
export interface AIMessage {
  _id: string;
  sender: { _id?: string; id?: string };
  content: string;
  createdAt: string;
  isAIResponse?: boolean;
  isRead?: boolean; // Added for consistency
}