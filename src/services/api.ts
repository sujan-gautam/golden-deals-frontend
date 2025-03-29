
import { User } from '../types/user';
import { Post, ProductPost, EventPost } from '../types/post';
import { Story } from '../types/story';
import { Conversation, Message } from '../types/message';
import { Comment } from '../types/comment';
import * as authService from './authService';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Helper function for API calls
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = authService.getToken();
  
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
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
    
    // If server is not available, fallback to local storage for development
    if (!navigator.onLine || error.message.includes('Failed to fetch')) {
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
      
      if (endpoint.includes('posts/') && endpoint.includes('/like') && options.method === 'POST') {
        const postId = endpoint.split('/')[1];
        return likeLocalPost(postId);
      }
      
      if (endpoint.includes('posts/') && endpoint.includes('/comments') && options.method === 'POST') {
        const postId = endpoint.split('/')[1];
        const content = options.body ? JSON.parse(options.body as string).content : '';
        return commentLocalPost(postId, content);
      }
      
      if (endpoint.includes('posts/') && endpoint.includes('/comments') && options.method === 'GET') {
        const postId = endpoint.split('/')[1];
        return getLocalComments(postId);
      }
      
      if (endpoint === 'events' && options.method === 'GET') {
        return getLocalEvents();
      }
      
      if (endpoint === 'products' && options.method === 'GET') {
        return getLocalProducts();
      }
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

export const updateProfile = async (userData: Partial<User>) => {
  return fetchAPI('auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
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

// Products APIs (filtered posts with type=product)
export const getProducts = async () => {
  return fetchAPI('products');
};

// Events APIs (filtered posts with type=event)
export const getEvents = async () => {
  return fetchAPI('events');
};

// Upload image
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = authService.getToken();
  
  try {
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
  } catch (error) {
    console.error('Error uploading image:', error);
    // For development, create mock image URL
    return { url: `https://source.unsplash.com/random/800x600?t=${Date.now()}` };
  }
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
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to create a post');
    }
    
    const posts = getLocalPosts();
    
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

const likeLocalPost = (postId: string) => {
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to like a post');
    }
    
    const posts = getLocalPosts();
    const updatedPosts = posts.map((post: any) => {
      if (post._id === postId) {
        const likes = Array.isArray(post.likes) ? post.likes : [];
        const userLiked = likes.includes(user._id);
        
        return {
          ...post,
          likes: userLiked ? likes.filter((id: string) => id !== user._id) : [...likes, user._id]
        };
      }
      return post;
    });
    
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    const updatedPost = updatedPosts.find((post: any) => post._id === postId);
    return updatedPost || { error: 'Post not found' };
  } catch (error) {
    console.error('Error liking post in localStorage', error);
    throw new Error('Failed to like post locally');
  }
};

const getLocalComments = (postId: string) => {
  try {
    const commentsJson = localStorage.getItem(`comments_${postId}`);
    return commentsJson ? JSON.parse(commentsJson) : [];
  } catch (error) {
    console.error('Error getting comments from localStorage', error);
    return [];
  }
};

const commentLocalPost = (postId: string, content: string) => {
  try {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to comment on a post');
    }
    
    // Update post comment count
    const posts = getLocalPosts();
    const updatedPosts = posts.map((post: any) => {
      if (post._id === postId) {
        return {
          ...post,
          comments: (post.comments || 0) + 1
        };
      }
      return post;
    });
    
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    // Save the new comment
    const comments = getLocalComments(postId);
    const newComment = {
      _id: `comment-${Date.now()}`,
      postId,
      userId: user._id,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      content,
      createdAt: new Date().toISOString(),
      likes: []
    };
    
    const updatedComments = [newComment, ...comments];
    localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));
    
    return newComment;
  } catch (error) {
    console.error('Error commenting on post in localStorage', error);
    throw new Error('Failed to comment on post locally');
  }
};

const getLocalEvents = () => {
  try {
    const events = localStorage.getItem('events');
    if (events) {
      return JSON.parse(events);
    }
    
    // If no events exist yet, create sample data
    const sampleEvents = [
      {
        _id: 'event-1',
        userId: 'admin',
        user: { _id: 'admin', name: 'USM Events', avatar: 'https://i.pravatar.cc/300?u=admin@usm.edu' },
        type: 'event',
        title: 'Spring Festival',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'M.M. Roberts Stadium',
        content: 'Join us for the annual Spring Festival with food, music, and games!',
        image: 'https://source.unsplash.com/random/800x600/?festival',
        likes: [],
        comments: 0,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'event-2',
        userId: 'admin',
        user: { _id: 'admin', name: 'USM Events', avatar: 'https://i.pravatar.cc/300?u=admin@usm.edu' },
        type: 'event',
        title: 'Graduation Ceremony',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Reed Green Coliseum',
        content: 'Commencement ceremony for the graduating class of 2023.',
        image: 'https://source.unsplash.com/random/800x600/?graduation',
        likes: [],
        comments: 0,
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('events', JSON.stringify(sampleEvents));
    return sampleEvents;
  } catch (error) {
    console.error('Error getting events from localStorage', error);
    return [];
  }
};

const getLocalProducts = () => {
  try {
    const products = localStorage.getItem('products');
    if (products) {
      return JSON.parse(products);
    }
    
    // If no products exist yet, create sample data
    const sampleProducts = [
      {
        _id: 'product-1',
        userId: 'seller1',
        user: { _id: 'seller1', name: 'John Student', avatar: 'https://i.pravatar.cc/300?u=seller1@usm.edu' },
        type: 'product',
        productName: 'Calculus Textbook',
        price: '$45',
        category: 'Books',
        condition: 'Like New',
        status: 'instock',
        content: 'Calculus: Early Transcendentals 8th Edition. Barely used.',
        image: 'https://source.unsplash.com/random/800x600/?textbook',
        likes: [],
        comments: 0,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'product-2',
        userId: 'seller2',
        user: { _id: 'seller2', name: 'Jane Student', avatar: 'https://i.pravatar.cc/300?u=seller2@usm.edu' },
        type: 'product',
        productName: 'USM Hoodie',
        price: '$25',
        category: 'Clothing',
        condition: 'Good',
        status: 'instock',
        content: 'Size M, black USM hoodie. Worn a few times.',
        image: 'https://source.unsplash.com/random/800x600/?hoodie',
        likes: [],
        comments: 0,
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('products', JSON.stringify(sampleProducts));
    return sampleProducts;
  } catch (error) {
    console.error('Error getting products from localStorage', error);
    return [];
  }
};

// Mock data for development
const mockLoginResponse = (credentials: { email: string, password: string }) => {
  const mockUser = {
    _id: "user-" + Date.now(),
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
    _id: "user-" + Date.now(),
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
  const storedUser = authService.getCurrentUser();
  if (storedUser) {
    return storedUser;
  }
  
  const defaultUser = {
    _id: "user-" + Date.now(),
    name: "Demo User",
    email: "demo@example.com",
    avatar: "https://i.pravatar.cc/300?u=demo@example.com",
    role: "user",
    createdAt: new Date().toISOString()
  };
  
  return defaultUser;
};

const mockStoriesResponse = () => {
  return [];
};
