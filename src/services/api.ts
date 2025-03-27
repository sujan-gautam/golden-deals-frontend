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
  
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Return mock data for development when API is unavailable
    if (endpoint === 'auth/login') {
      return mockLoginResponse(options.body ? JSON.parse(options.body as string) : {});
    }
    
    if (endpoint === 'auth/register') {
      return mockRegisterResponse(options.body ? JSON.parse(options.body as string) : {});
    }
    
    if (endpoint === 'auth/me') {
      return mockCurrentUserResponse();
    }
    
    if (endpoint === 'posts') {
      return mockPostsResponse();
    }
    
    if (endpoint === 'stories') {
      return mockStoriesResponse();
    }
    
    // Re-throw for other endpoints that don't have mock data
    throw error;
  }
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

// Mock data for development
const mockLoginResponse = (credentials: { email: string, password: string }) => {
  const mockUser = {
    _id: "user123",
    name: "Demo User",
    email: credentials.email,
    avatar: "https://i.pravatar.cc/300?u=" + credentials.email,
    role: "user",
    createdAt: new Date().toISOString()
  };
  
  return {
    token: "mock-jwt-token-" + Date.now(),
    user: mockUser
  };
};

const mockRegisterResponse = (userData: { name: string, email: string, password: string }) => {
  const mockUser = {
    _id: "user123",
    name: userData.name,
    email: userData.email,
    avatar: "https://i.pravatar.cc/300?u=" + userData.email,
    role: "user",
    createdAt: new Date().toISOString()
  };
  
  return {
    token: "mock-jwt-token-" + Date.now(),
    user: mockUser
  };
};

const mockCurrentUserResponse = () => {
  return {
    _id: "user123",
    name: "Demo User",
    email: "demo@example.com",
    avatar: "https://i.pravatar.cc/300?u=demo@example.com",
    role: "user",
    createdAt: new Date().toISOString()
  };
};

const mockPostsResponse = () => {
  return [
    {
      _id: "post1",
      userId: "user123",
      user: {
        _id: "user123",
        name: "Demo User",
        avatar: "https://i.pravatar.cc/300?u=demo@example.com"
      },
      content: "This is a mock post for development when the API is not available.",
      image: "https://picsum.photos/seed/post1/800/600",
      likes: [],
      comments: 3,
      createdAt: new Date().toISOString(),
      type: "post"
    },
    {
      _id: "post2",
      userId: "user456",
      user: {
        _id: "user456",
        name: "Another User",
        avatar: "https://i.pravatar.cc/300?u=another@example.com"
      },
      content: "This is a mock product listing.",
      image: "https://picsum.photos/seed/product1/800/600",
      likes: [],
      comments: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      type: "product",
      productName: "Vintage Camera",
      price: "$199.99",
      condition: "Used - Like New",
      status: "instock"
    }
  ];
};

const mockStoriesResponse = () => {
  return [
    {
      _id: "story1",
      userId: "user123",
      user: {
        _id: "user123",
        name: "Demo User",
        avatar: "https://i.pravatar.cc/300?u=demo@example.com"
      },
      media: "https://picsum.photos/seed/story1/800/1200",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      views: []
    }
  ];
};
