// src/services/comment-api.ts
import { Comment } from '../types/comment';
import { fetchAPI } from './api';

// Comment on a Post
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

  const comment = response.data; // Backend returns the new comment in data
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

// Like a Comment on a Post


// Comment on a Product
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

  const comment = response.data; // Backend returns the new comment in data
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

// Like a Comment on a Product


// Comment on an Event
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

  const comment = response.data; // Backend returns the new comment in data
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


export const likeCommentOnPost = async (postId: string, commentId: string): Promise<Comment> => {
  try {
    const response = await fetchAPI(`posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error liking comment ${commentId} on post ${postId}:`, error);
    if (error.status === 404) {
      throw new Error('Post or comment not found');
    }
    throw new Error(error.message || 'Failed to like comment');
  }
};

export const likeCommentOnProduct = async (postId: string, commentId: string): Promise<Comment> => {
  try {
    const response = await fetchAPI(`products/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error liking comment ${commentId} on product ${postId}:`, error);
    if (error.status === 404) {
      throw new Error('Product or comment not found');
    }
    throw new Error(error.message || 'Failed to like comment');
  }
};

export const likeCommentOnEvent = async (postId: string, commentId: string): Promise<Comment> => {
  try {
    const response = await fetchAPI(`events/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error liking comment ${commentId} on event ${postId}:`, error);
    if (error.status === 404) {
      throw new Error('Event or comment not found');
    }
    throw new Error(error.message || 'Failed to like comment');
  }
};

// Get Comments for a Post/Product/Event
export const getComments = async (postId: string, type: 'post' | 'product' | 'event'): Promise<Comment[]> => {
  try {
    let response;
    if (type === 'post') {
      response = await fetchAPI(`posts/${postId}`, { method: 'GET' });
    } else if (type === 'product') {
      response = await fetchAPI(`products/${postId}`, { method: 'GET' });
    } else if (type === 'event') {
      response = await fetchAPI(`events/${postId}`, { method: 'GET' });
    }

    // Check if response contains the expected data
    if (!response || (!response._id && !response.data)) {
      console.warn(`No ${type} found for ID ${postId}`, { response });
      throw new Error(`No ${type} found for ID ${postId}`);
    }

    // Handle both direct object and wrapped data responses
    const item = response.data || response;
    const comments = item.comments || [];
    console.log('Raw comments from server:', comments); // Debug log
    return comments.map((comment: any) => ({
      _id: comment._id || `comment-${Date.now()}`,
      postId,
      userId: comment.user_id?._id || comment.user_id || 'unknown',
      content: comment.content || '',
      likes: Array.isArray(comment.likes)
        ? comment.likes.map((id: any) => id.toString()) // Convert ObjectIds to strings
        : [],
      parentId: comment.parentId || null,
      mentions: comment.mentions || [],
      createdAt: comment.createdAt || new Date().toISOString(),
      user: {
        _id: comment.user_id?._id || comment.user_id || 'unknown',
        name: comment.user_id?.name || comment.user_id?.username || 'Anonymous',
        avatar: comment.user_id?.avatar
          ? `${import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000'}${comment.user_id.avatar}`
          : 'https://i.pravatar.cc/300',
        username: comment.user_id?.username || 'anonymous',
      },
      replies: comment.replies || [],
    }));
  } catch (error: any) {
    console.error(`Failed to fetch comments for ${type} ${postId}:`, error.message);
    throw error;
  }
};


  
  