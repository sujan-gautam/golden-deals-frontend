
import { User } from '../types/user';
import { toast } from '@/components/ui/use-toast';

// localStorage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REGISTERED_USERS_KEY = 'registeredUsers';

// Types
type RegisteredUser = {
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

// Get registered users from localStorage
export const getRegisteredUsers = (): RegisteredUser[] => {
  try {
    const users = localStorage.getItem(REGISTERED_USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error parsing registered users', error);
    return [];
  }
};

// Save a registered user to localStorage
export const saveRegisteredUser = (email: string, password: string): void => {
  try {
    const users = getRegisteredUsers();
    const existingUser = users.find(user => user.email === email);
    
    if (!existingUser) {
      const updatedUsers = [...users, { email, password }];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    }
  } catch (error) {
    console.error('Error saving registered user', error);
    throw new Error('Failed to register user');
  }
};

// Check if a user exists with given credentials
export const isRegisteredUser = (email: string, password: string): boolean => {
  const users = getRegisteredUsers();
  return users.some(user => user.email === email && user.password === password);
};

// Get the current authenticated user
export const getCurrentUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error getting current user', error);
    return null;
  }
};

// Get the auth token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Save auth data (token and user)
export const saveAuthData = (response: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
};

// Clear auth data (for logout)
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Update user profile data
export const updateUserProfile = (userData: Partial<User>): User => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    throw new Error('No authenticated user found');
  }
  
  const updatedUser = { ...currentUser, ...userData };
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getCurrentUser();
};
