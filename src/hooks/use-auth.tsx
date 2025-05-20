import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, firstname: string, lastname: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
  withCredentials: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/users/current', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if response contains user data
        if (response.data.id) {
          const user: User = {
            id: response.data.id,
            username: response.data.username,
            firstname: response.data.firstname,
            lastname: response.data.lastname || response.data.firstname,
            email: response.data.email,
            avatar: response.data.avatar,
          };
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user)); // Sync localStorage
        } else {
          throw new Error('Invalid user data');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ accesstoken: string; user: User }>('/users/login', {
        email,
        password,
      });

      const token = response.data.accesstoken;
      if (!token) throw new Error('No access token received');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsAuthenticated(true);

      const userResponse = await api.get('/users/current', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.data.id) {
        const user: User = {
          id: userResponse.data.id,
          username: userResponse.data.username,
          firstname: userResponse.data.firstname,
          lastname: userResponse.data.lastname || userResponse.data.firstname,
          email: userResponse.data.email,
          avatar: userResponse.data.avatar,
        };
        setUser(user);
        toast({
          title: 'Welcome back!',
          description: "You've successfully signed in.",
        });
        navigate('/feed');
      } else {
        throw new Error('User verification failed after login');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, firstname: string, lastname: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/users/register', {
        username,
        firstname,
        lastname,
        email,
        password,
        confirm_password: password,
      });

      const loginResponse = await api.post<{ accesstoken: string; user: User }>('/users/login', {
        email,
        password,
      });

      const token = loginResponse.data.accesstoken;
      if (!token) throw new Error('No access token received');

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

      const userResponse = await api.get('/users/current', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.data.id) {
        const user: User = {
          id: userResponse.data.id,
          username: userResponse.data.username,
          firstname: userResponse.data.firstname,
          lastname: userResponse.data.lastname || userResponse.data.firstname,
          email: userResponse.data.email,
          avatar: userResponse.data.avatar,
        };
        setUser(user);
        setIsAuthenticated(true);
        toast({
          title: 'Account created!',
          description: "You've successfully signed up.",
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    setIsAuthenticated(false);
    navigate('/signin');
    toast({
      title: 'Signed out',
      description: "You've been successfully signed out.",
    });
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await api.put('/users/current', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile.';
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/users/current', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.id) {
        const user: User = {
          id: response.data.id,
          username: response.data.username,
          firstname: response.data.firstname,
          lastname: response.data.lastname || response.data.firstname,
          email: response.data.email,
          avatar: response.data.avatar,
        };
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
