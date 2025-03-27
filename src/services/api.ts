
import { User } from '../types/user';
import { Post, ProductPost, EventPost } from '../types/post';
import { Story } from '../types/story';
import { Conversation, Message } from '../types/message';
import { Comment } from '../types/comment';

const API_URL = 'http://localhost:5000/api';

// Helper function for API calls
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Auth APIs
export const loginUser = async (email: string, password: string) => {
  return fetchAPI('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (name: string, email: string, password: string) => {
  return fetchAPI('auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

export const getCurrentUser = async () => {
  return fetchAPI('auth/me');
};

// Posts APIs
export const getPosts = async () => {
  return fetchAPI('posts');
};

export const createPost = async (post: Partial<Post>) => {
  return fetchAPI('posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
};

export const likePost = async (postId: string) => {
  return fetchAPI(`posts/${postId}/like`, {
    method: 'POST',
  });
};

export const commentOnPost = async (postId: string, content: string) => {
  return fetchAPI(`posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};

export const getComments = async (postId: string) => {
  return fetchAPI(`posts/${postId}/comments`);
};

// Stories APIs
export const getStories = async () => {
  return fetchAPI('stories');
};

export const createStory = async (story: Partial<Story>) => {
  return fetchAPI('stories', {
    method: 'POST',
    body: JSON.stringify(story),
  });
};

export const viewStory = async (storyId: string) => {
  return fetchAPI(`stories/${storyId}/view`, {
    method: 'POST',
  });
};

// Messages APIs
export const getConversations = async () => {
  return fetchAPI('conversations');
};

export const getMessages = async (conversationId: string) => {
  return fetchAPI(`conversations/${conversationId}/messages`);
};

export const sendMessage = async (conversationId: string, content: string) => {
  return fetchAPI(`conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};

export const createConversation = async (receiverId: string) => {
  return fetchAPI('conversations', {
    method: 'POST',
    body: JSON.stringify({ receiverId }),
  });
};

// Users APIs
export const getUsers = async () => {
  return fetchAPI('users');
};

// Products APIs
export const getProducts = async () => {
  return fetchAPI('products');
};

// Events APIs
export const getEvents = async () => {
  return fetchAPI('events');
};

// Upload image
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};
