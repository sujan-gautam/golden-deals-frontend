import { User } from '../types/user';
import { Post, ProductPost, EventPost } from '../types/post';
import { Story } from '../types/story';
import { Conversation, Message } from '../types/message';
import { Comment } from '../types/comment';
import * as authService from './authService';
import { getToken } from './authService';

// Use import.meta.env for Vite
const API_URL = import.meta.env.VITE_API_URL ;

const API_KEY = import.meta.env.VITE_API_KEY;

// Helper function for API calls
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = authService.getToken();
  // console.log(`Fetching ${endpoint} with token:`, token);

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'x-api-key': API_KEY || 'mySuperSecretToken',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || errorMessage;
        if (response.status === 401) {
          console.warn('Unauthorized access, logging out...');
          authService.logout();
          window.location.href = '/login';
        } else if (response.status === 403) {
          console.warn('Forbidden: Check x-api-key configuration');
        }
      } catch {
        errorMessage = text.slice(0, 50) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid response format from ${endpoint}: ${text.slice(0, 50)}...`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
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

export const getCurrentUser = async (): Promise<User> => {
  return fetchAPI('auth/me');
};

export const updateProfile = async (userData: Partial<User>) => {
  return fetchAPI('auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
};


// Messaging APIs
export const createConversation = async (receiverId: string): Promise<Conversation> => {
  if (!receiverId || !/^[0-9a-fA-F]{24}$/.test(receiverId)) {
    throw new Error('Invalid receiver ID');
  }
  console.log('Sending createConversation request with receiverId:', receiverId);
  return fetchAPI('messages/conversation', {
    method: 'POST',
    body: JSON.stringify({ receiverId }),
  });
};

export const sendMessage = async (data: {
  conversationId: string;
  content: string;
  product?: {
    _id: string;
    title: string;
    price: number | null;
    image: string | null;
    condition: string | null;
    category: string | null;
  };
  isAIResponse?: boolean;
}): Promise<Message> => {
  console.log('Sending message request:', data);
  const response = await fetchAPI('messages', {
    method: 'POST',
    body: JSON.stringify({
      conversationId: data.conversationId,
      content: data.content,
      product: data.product || null,
      isAIResponse: data.isAIResponse || false,
    }),
  });
  console.log('Message sent response:', response);
  return response;
};

export const getConversations = async (): Promise<Conversation[]> => {
  return fetchAPI('messages/conversations');
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  return fetchAPI(`messages/conversation/${conversationId}`);
};

export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  console.log('Marking messages as read for conversation:', conversationId);
  return fetchAPI(`messages/conversation/${conversationId}/read`, {
    method: 'POST',
  });
};


// Users APIs (for NewConversationModal search)
export const searchUsers = async (query: string = ''): Promise<User[]> => {
  // Assuming your backend supports a search query on /users/home
  return fetchAPI('users/home', {
    method: 'GET',
    // Add query param if your backend supports it; otherwise, filter client-side
  });
};
// Posts APIs
export const getPosts = async (): Promise<Post[]> => {
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


// src/services/comment-api.ts
export const getEventComments = async (eventId: string): Promise<Comment[]> => {
  try {
    const response = await fetchAPI(`events/${eventId}/comments`, { method: "GET" });
    const comments = response.data || response;
    console.log("Event comments from server:", comments);
    return comments.map((comment: any) => ({
      _id: comment._id || `comment-${Date.now()}`,
      postId: eventId,
      userId: comment.user_id?._id || comment.user_id || "unknown",
      content: comment.content || "",
      likes: Array.isArray(comment.likes)
        ? comment.likes.map((id: any) => id.toString())
        : [],
      parentId: comment.parentId || null,
      mentions: comment.mentions || [],
      createdAt: comment.createdAt || new Date().toISOString(),
      user: {
        _id: comment.user_id?._id || comment.user_id || "unknown",
        name: comment.user_id?.name || comment.user_id?.username || "Anonymous",
        avatar: comment.user_id?.avatar
          ? `${import.meta.env.VITE_IMAGE_URL || "http://localhost:5000"}${comment.user_id.avatar}`
          : "https://i.pravatar.cc/300",
        username: comment.user_id?.username || "anonymous",
      },
      replies: comment.replies || [],
    }));
  } catch (error: any) {
    console.error(`Failed to fetch comments for event ${eventId}:`, error.message);
    throw error;
  }
};

export const markInterestedInEvent = async (eventId: string) => {
  return fetchAPI(`events/${eventId}/interested`, {
    method: 'POST',
  });
};

export const sharePost = async (postId: string) => {
  return fetchAPI(`posts/${postId}/share`, {
    method: 'POST',
  });
};

// Stories APIs
export const getStories = async (): Promise<Story[]> => {
  return fetchAPI('stories/all');
};

export const createStory = async (story: Partial<Story> & { imageFile: File }) => { // Changed imageFile to required File
  console.log('createStory input:', story);
  const formData = new FormData();
  
  if (!(story.imageFile instanceof File)) {
    throw new Error('imageFile must be a File object');
  }
  console.log('Appending image:', story.imageFile.name, story.imageFile.size, story.imageFile.type);
  formData.append('image', story.imageFile);
  
  formData.append('text', story.text || '');
  formData.append('textColor', story.textColor || '#ffffff');

  console.log('FormData contents:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  return fetchAPI('stories', {
    method: 'POST',
    body: formData,
  });
};

export const viewStory = async (storyId: string): Promise<Story> => {
  return fetchAPI(`stories/${storyId}/view`, {
    method: 'GET',
  });
};

export const editStory = async (storyId: string, updatedStory: Partial<Story> & { imageFile?: File }) => {
  const formData = new FormData();
  if (updatedStory.imageFile) {
    formData.append('image', updatedStory.imageFile);
  }
  if (updatedStory.text !== undefined) {
    formData.append('text', updatedStory.text); // Ensure text is always sent
  }
  if (updatedStory.textColor !== undefined) {
    formData.append('textColor', updatedStory.textColor);
  }

  console.log('Sending edit request with FormData:');
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  const response = await fetchAPI(`stories/${storyId}`, {
    method: 'PUT',
    body: formData,
  });

  console.log('Edit story response:', response);
  return response;
};


export const deleteStory = async (storyId: string) => {
  return fetchAPI(`stories/${storyId}`, {
    method: 'DELETE',
  });
};


// Users APIs
export const getUsers = async (): Promise<User[]> => {
  return fetchAPI('users');
};

// Products APIs
export const getProducts = async (): Promise<ProductPost[]> => {
  return fetchAPI('products');
};

// Events APIs
export const getEvents = async (): Promise<EventPost[]> => {
  return fetchAPI('events');
};

export const getEventById = async (eventId: string): Promise<EventPost> => {
  return fetchAPI(`events/${eventId}`, {
    method: 'GET',
  });
};

// Upload image (standalone, if needed)
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = authService.getToken();
  
  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-api-key': API_KEY,
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
    return { url: `https://source.unsplash.com/random/800x600?t=${Date.now()}` };
  }
};

// Local storage helpers
const getLocalPosts = (): Post[] => {
  try {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
  } catch {
    return [];
  }
};

const saveLocalPost = (postData: any) => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User must be authenticated');
  
  const posts = getLocalPosts();
  const newPost = {
    _id: `post-${Date.now()}`,
    userId: user._id,
    user: { _id: user._id, name: user.name, avatar: user.avatar },
    content: postData.content || '',
    image: postData.image,
    likes: [],
    comments: 0,
    createdAt: new Date().toISOString(),
    ...postData,
  };
  
  const updatedPosts = [newPost, ...posts];
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  return newPost;
};

const likeLocalPost = (postId: string) => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User must be authenticated');
  
  const posts = getLocalPosts();
  const updatedPosts = posts.map((post: any) => {
    if (post._id === postId) {
      const likes = Array.isArray(post.likes) ? post.likes : [];
      const userLiked = likes.includes(user._id);
      return {
        ...post,
        likes: userLiked ? likes.filter((id: string) => id !== user._id) : [...likes, user._id],
      };
    }
    return post;
  });
  
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  return updatedPosts.find((post: any) => post._id === postId) || { error: 'Post not found' };
};

const getLocalComments = (postId: string): Comment[] => {
  try {
    const commentsJson = localStorage.getItem(`comments_${postId}`);
    const comments = commentsJson ? JSON.parse(commentsJson) : [];
    const user = authService.getCurrentUser();
    
    return comments.map((comment: any) => ({
      ...comment,
      user: comment.user || { _id: comment.userId, name: 'Unknown', avatar: 'https://i.pravatar.cc/300' },
      liked: user && Array.isArray(comment.likes) ? comment.likes.includes(user._id) : false,
    }));
  } catch {
    return [];
  }
};

const commentLocalPost = (postId: string, content: string, parentId?: string) => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User must be authenticated');
  
  const posts = getLocalPosts();
  const updatedPosts = posts.map((post: any) => {
    if (post._id === postId) {
      return { ...post, comments: (post.comments || 0) + 1 };
    }
    return post;
  });
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  
  const comments = getLocalComments(postId);
  const newComment = {
    _id: `comment-${Date.now()}`,
    postId,
    userId: user._id,
    user: { _id: user._id, name: user.name, avatar: user.avatar },
    content,
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
    likes: [],
  };
  
  const updatedComments = [newComment, ...comments];
  localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));
  return newComment;
};

const getLocalStories = (): Story[] => {
  try {
    const stories = localStorage.getItem('stories');
    return stories ? JSON.parse(stories) : [];
  } catch {
    return [];
  }
};

const viewLocalStory = (storyId: string) => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error('User must be authenticated');
  
  const stories = getLocalStories();
  const updatedStories = stories.map((story: any) => {
    if (story._id === storyId) {
      const views = Array.isArray(story.views) ? story.views : [];
      if (!views.includes(user._id)) {
        views.push(user._id);
      }
      return { ...story, views };
    }
    return story;
  });
  
  localStorage.setItem('stories', JSON.stringify(updatedStories));
  return updatedStories.find((story: any) => story._id === storyId) || { error: 'Story not found' };
};

const getLocalEvents = (): EventPost[] => {
  return getLocalPosts().filter((post: any) => post.type === 'event');
};

const getLocalEventById = (eventId: string): EventPost => {
  const events = getLocalEvents();
  const event = events.find((e: any) => e._id === eventId);
  return event || {
    _id: eventId,
    event_title: 'Offline Event',
    event_details: 'This event is available offline.',
    event_date: new Date().toISOString(),
    event_location: 'Unknown Location',
    user_id: { _id: 'offline-user', name: 'Offline User', avatar: 'https://i.pravatar.cc/300' },
    interested: [],
    likes: [],
    comments: 0,
    createdAt: new Date().toISOString(),
    type: 'event',
  };
};

const getLocalProducts = (): ProductPost[] => {
  return getLocalPosts().filter((post: any) => post.type === 'product');
};

// Mock data
const mockLoginResponse = (credentials: { email: string; password: string }) => {
  const mockUser = {
    _id: `user-${Date.now()}`,
    name: 'Demo User',
    email: credentials.email,
    avatar: `https://i.pravatar.cc/300?u=${credentials.email}`,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  return { token: `mock-jwt-${Date.now()}`, user: mockUser };
};

const mockRegisterResponse = (userData: { name: string; email: string; password: string }) => {
  const mockUser = {
    _id: `user-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    avatar: `https://i.pravatar.cc/300?u=${userData.email}`,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  return { token: `mock-jwt-${Date.now()}`, user: mockUser };
};

const mockCurrentUserResponse = (): User => {
  const storedUser = authService.getCurrentUser();
  return storedUser || {
    _id: `user-${Date.now()}`,
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://i.pravatar.cc/300?u=demo@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
  };
};

// new comment apis
// Comment APIs
// Products APIs
export const commentOnProduct = async (
  productId: string,
  content: string,
  parentId?: string,
  mentions?: string[]
): Promise<Comment> => {
  if (!productId || !content.trim()) {
    throw new Error('Product ID and content are required');
  }
  console.log('Posting comment on product:', { productId, content, parentId, mentions });
  const response = await fetchAPI(`products/${productId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId, mentions: mentions || [] }),
  });
  console.log('Product comment response:', response);

  const comment = response.data; // Backend now returns the new comment directly
  if (!comment || !comment.user_id) {
    console.error('Invalid comment response:', response);
    throw new Error('Invalid comment data');
  }

  return {
    _id: comment._id || `comment-${Date.now()}`,
    postId: productId,
    userId: comment.user_id._id || '',
    content: comment.content || content,
    likes: comment.likes || [],
    parentId: comment.parentId || null,
    mentions: comment.mentions || [],
    createdAt: comment.createdAt || new Date().toISOString(),
    user: {
      _id: comment.user_id._id || '',
      name: comment.user_id.name || comment.user_id.username || 'Anonymous',
      avatar: comment.user_id.avatar
        ? `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${comment.user_id.avatar}`
        : 'https://i.pravatar.cc/300',
      username: comment.user_id.username || 'anonymous',
    },
    replies: comment.replies || [],
  };
};



export const likeCommentOnProduct = async (productId: string, commentId: string): Promise<Comment> => {
  if (!productId || !commentId) {
    throw new Error('Product ID and comment ID are required');
  }
  console.log('Liking comment on product:', { productId, commentId });
  return fetchAPI(`products/${productId}/comments/${commentId}/like`, {
    method: 'POST',
  });
};

// Posts APIs
export const commentOnPost = async (
  postId: string,
  content: string,
  parentId?: string,
  mentions?: string[]
): Promise<Comment> => {
  if (!postId || !content.trim()) {
    throw new Error('Post ID and content are required');
  }
  const response = await fetchAPI(`posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId, mentions: mentions || [] }),
  });

  const comment = response.data;
  if (!comment || !comment.user_id) {
    throw new Error('Invalid comment data');
  }

  return {
    _id: comment._id,
    postId,
    userId: comment.user_id._id,
    content: comment.content,
    likes: comment.likes || [],
    parentId: comment.parentId || null,
    mentions: comment.mentions || [],
    createdAt: comment.createdAt,
    user: {
      _id: comment.user_id._id,
      name: comment.user_id.name || comment.user_id.username,
      avatar: comment.user_id.avatar
        ? `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${comment.user_id.avatar}`
        : 'https://i.pravatar.cc/300',
      username: comment.user_id.username,
    },
    replies: comment.replies || [],
  };
};

export const likeCommentOnPost = async (postId: string, commentId: string): Promise<Comment> => {
  if (!postId || !commentId) {
    throw new Error('Post ID and comment ID are required');
  }
  return fetchAPI(`posts/${postId}/comments/${commentId}/like`, {
    method: 'POST',
  });
};

// Events APIs

export const commentOnEvent = async (
  eventId: string,
  content: string,
  parentId?: string,
  mentions?: string[]
): Promise<Comment> => {
  if (!eventId || !content.trim()) {
    throw new Error('Event ID and content are required');
  }
  console.log('Posting comment on event:', { eventId, content, parentId, mentions });
  const response = await fetchAPI(`events/${eventId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId, mentions: mentions || [] }),
  });
  console.log('Event comment response:', response);

  const comment = response.data; // Backend now returns the new comment directly
  if (!comment || !comment.user_id) {
    console.error('Invalid comment response:', response);
    throw new Error('Invalid comment data');
  }

  return {
    _id: comment._id || `comment-${Date.now()}`,
    postId: eventId,
    userId: comment.user_id._id || '',
    content: comment.content || content,
    likes: comment.likes || [],
    parentId: comment.parentId || null,
    mentions: comment.mentions || [],
    createdAt: comment.createdAt || new Date().toISOString(),
    user: {
      _id: comment.user_id._id || '',
      name: comment.user_id.name || comment.user_id.username || 'Anonymous',
      avatar: comment.user_id.avatar
        ? `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${comment.user_id.avatar}`
        : 'https://i.pravatar.cc/300',
      username: comment.user_id.username || 'anonymous',
    },
    replies: comment.replies || [],
  };
};


export const likeCommentOnEvent = async (eventId: string, commentId: string): Promise<Comment> => {
  if (!eventId || !commentId) {
    throw new Error('Event ID and comment ID are required');
  }
  console.log('Liking comment on event:', { eventId, commentId });
  return fetchAPI(`events/${eventId}/comments/${commentId}/like`, {
    method: 'POST',
  });
};
