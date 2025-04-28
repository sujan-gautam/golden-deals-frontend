import { fetchAPI } from './api';
import { User } from '../types/user';
import { Post, ProductPost, EventPost } from '../types/post';

export interface SearchResult {
  users: User[];
  posts: Post[];
  products: ProductPost[];
  events: EventPost[];
}

export const searchAll = async (query: string): Promise<SearchResult> => {
  if (!query.trim()) {
    throw new Error('Search query is required');
  }
  try {
    const response = await fetchAPI(`search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
    console.log('searchAll raw response:', response);
    // Handle cases where response is the data directly or wrapped in response.data
    const data = response.data || response;
    console.log('searchAll parsed data:', data);
    const result = {
      users: Array.isArray(data.users) ? data.users : [],
      posts: Array.isArray(data.posts) ? data.posts : [],
      products: Array.isArray(data.products) ? data.products : [],
      events: Array.isArray(data.events) ? data.events : [],
    };
    console.log('searchAll result:', result);
    return result;
  } catch (error) {
    console.error('searchAll error:', error);
    return { users: [], posts: [], products: [], events: [] };
  }
};

export const advancedSearch = async (searchParams: {
  query: string;
  type?: 'users' | 'posts' | 'products' | 'events';
  userId?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  condition?: string;
  eventDateFrom?: string;
  eventDateTo?: string;
  location?: string;
}): Promise<SearchResult> => {
  if (!searchParams.query.trim()) {
    throw new Error('Search query is required');
  }
  try {
    const response = await fetchAPI('search/advanced', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
    console.log('advancedSearch raw response:', response);
    const data = response.data || response;
    console.log('advancedSearch parsed data:', data);
    const result = {
      users: Array.isArray(data.users) ? data.users : [],
      posts: Array.isArray(data.posts) ? data.posts : [],
      products: Array.isArray(data.products) ? data.products : [],
      events: Array.isArray(data.events) ? data.events : [],
    };
    console.log('advancedSearch result:', result);
    return result;
  } catch (error) {
    console.error('advancedSearch error:', error);
    return { users: [], posts: [], products: [], events: [] };
  }
};