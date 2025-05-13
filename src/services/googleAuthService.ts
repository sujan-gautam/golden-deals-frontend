import axios from 'axios';
import { User } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

export const handleGoogleLogin = async (token: string): Promise<{ token: string; user: User }> => {
  try {
    console.log('Fetching user with token:', token);
    const response = await api.get('/users/current', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('API response:', response.data);

    const user: User = {
      _id: response.data.id,
      username: response.data.username,
      firstname: response.data.firstname,
      lastname: response.data.lastname || response.data.firstname,
      email: response.data.email,
      avatar: response.data.avatar,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error: any) {
    console.error('Google login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Google login failed');
  }
};

export const googleSignOut = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};