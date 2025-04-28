import { User } from '../types/user';
import { toast } from '@/components/ui/use-toast';
import { loginUser, registerUser, getCurrentUser as getCurrentUserAPI } from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Decode JWT to check expiry
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    // console.log('Token expiry:', new Date(exp), 'Current time:', new Date());
    return Date.now() > exp;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Assume expired if decoding fails
  }
};

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Optional: Verify token hasn't expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('token');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    localStorage.removeItem('token');
    return null;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('token');
};

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    const response = await loginUser(email, password);
    saveAuthData(response);
    console.log('Logged in, token saved:', response.token);
    return response;
  } catch (error: any) {
    console.error('Login failed:', error);
    toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    throw error;
  }
};

export const register = async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    const response = await registerUser(name, email, password);
    saveAuthData(response);
    return response;
  } catch (error: any) {
    console.error('Registration failed:', error);
    toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    const user = await getCurrentUserAPI();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null;
  }
};

export const saveAuthData = (response: { token: string; user: User }): void => {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const updateUserProfile = (userData: Partial<User>): User => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No authenticated user found');
  }
  const updatedUser = { ...currentUser, ...userData };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};