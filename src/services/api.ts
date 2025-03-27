
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
    
    // Use local storage for persistence in development when API is unavailable
    if (endpoint === 'auth/login') {
      return mockLoginResponse(options.body ? JSON.parse(options.body as string) : {});
    }
    
    if (endpoint === 'auth/register') {
      return mockRegisterResponse(options.body ? JSON.parse(options.body as string) : {});
    }
    
    if (endpoint === 'auth/me') {
      return mockCurrentUserResponse();
    }
    
    if (endpoint === 'posts' && options.method === 'GET') {
      return getLocalPosts();
    }
    
    if (endpoint === 'posts' && options.method === 'POST') {
      return saveLocalPost(options.body ? JSON.parse(options.body as string) : {});
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
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  const userId = JSON.parse(localStorage.getItem('user') || '{}')._id;
  
  // Find the post and toggle like
  const updatedPosts = posts.map((post: any) => {
    if (post._id === postId) {
      const likes = Array.isArray(post.likes) ? post.likes : [];
      const userLiked = likes.includes(userId);
      
      return {
        ...post,
        likes: userLiked ? likes.filter((id: string) => id !== userId) : [...likes, userId]
      };
    }
    return post;
  });
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  
  return fetchAPI(`posts/${postId}/like`, {
    method: 'POST',
  });
};

export const commentOnPost = async (postId: string, content: string) => {
  // Get posts from localStorage
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  
  // Find the post and increment comments
  const updatedPosts = posts.map((post: any) => {
    if (post._id === postId) {
      return {
        ...post,
        comments: (post.comments || 0) + 1
      };
    }
    return post;
  });
  
  // Save back to localStorage
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  
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

// Local storage persistence helpers
const getLocalPosts = () => {
  try {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
  } catch (error) {
    console.error('Error getting posts from localStorage', error);
    return [];
  }
};

const saveLocalPost = (postData: any) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    
    const newPost = {
      _id: 'post-' + Date.now(),
      userId: user._id,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      content: postData.content || postData.description || '',
      image: postData.image,
      likes: [],
      comments: 0,
      createdAt: new Date().toISOString(),
      ...postData
    };
    
    const updatedPosts = [newPost, ...posts];
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    return newPost;
  } catch (error) {
    console.error('Error saving post to localStorage', error);
    throw new Error('Failed to save post locally');
  }
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
  
  localStorage.setItem('user', JSON.stringify(mockUser));
  
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
  
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  return {
    token: "mock-jwt-token-" + Date.now(),
    user: mockUser
  };
};

const mockCurrentUserResponse = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  const defaultUser = {
    _id: "user123",
    name: "Demo User",
    email: "demo@example.com",
    avatar: "https://i.pravatar.cc/300?u=demo@example.com",
    role: "user",
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('user', JSON.stringify(defaultUser));
  return defaultUser;
};

const mockStoriesResponse = () => {
  return [];
};
