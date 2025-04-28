import axios from 'axios';
import { SavedItem } from '../types/savedItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_API_KEY || 'mySuperSecretToken';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Get all saved items for the authenticated user
export const getSavedItems = async (): Promise<SavedItem[]> => {
  try {
    const response = await api.get('/saved-items');
    console.log('getSavedItems response:', response.data);
    // Ensure response.data.data is an array
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return data;
  } catch (error: any) {
    console.error('getSavedItems error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch saved items');
  }
};

// Save an item (post, product, or event)
export const saveItem = async (
  item_type: 'post' | 'product' | 'event',
  item_id: string
): Promise<SavedItem> => {
  if (!item_type || !item_id) {
    throw new Error('Item type and ID are required');
  }
  if (!['post', 'product', 'event'].includes(item_type)) {
    throw new Error('Invalid item type');
  }
  try {
    const response = await api.post('/saved-items', { item_type, item_id });
    console.log('saveItem response:', response.data);
    return response.data.data; // Backend returns { data: SavedItem }
  } catch (error: any) {
    console.error('saveItem error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to save item');
  }
};

// Unsave an item
export const unsaveItem = async (savedItemId: string): Promise<void> => {
  if (!savedItemId) {
    throw new Error('Saved item ID is required');
  }
  try {
    await api.delete(`/saved-items/${savedItemId}`);
    console.log('unsaveItem success:', savedItemId);
  } catch (error: any) {
    console.error('unsaveItem error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to unsave item');
  }
};