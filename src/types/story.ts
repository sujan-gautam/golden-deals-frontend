
export interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  image: string;
  createdAt: string;
  content?: string;
  views?: number;
  duration?: number; // in seconds
  expiresAt?: string;
  location?: string;
  isViewed?: boolean;
}
