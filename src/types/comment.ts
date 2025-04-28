export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  likes: string[];
  parentId?: string | null;
  mentions?: string[]; 
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    avatar: string;
    username: string;
  };
  replies?: Comment[];
}

export interface CommentDisplay {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  likes: number;
  liked: boolean;
  createdAt: string;
  mentions?: string[];
  replies?: CommentDisplay[];
}