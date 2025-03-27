
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/user';
import { loginUser, registerUser, getCurrentUser } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Store registered users in local storage for demonstration purposes
  // In a real app, this would be handled by the backend
  const getRegisteredUsers = (): { email: string; password: string }[] => {
    try {
      const users = localStorage.getItem('registeredUsers');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error parsing registered users', error);
      return [];
    }
  };

  const saveRegisteredUser = (email: string, password: string) => {
    try {
      const users = getRegisteredUsers();
      const existingUser = users.find(user => user.email === email);
      
      if (!existingUser) {
        const updatedUsers = [...users, { email, password }];
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error('Error saving registered user', error);
    }
  };

  const isRegisteredUser = (email: string, password: string): boolean => {
    const users = getRegisteredUsers();
    return users.some(user => user.email === email && user.password === password);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user exists in our registered users
      if (!isRegisteredUser(email, password)) {
        throw new Error("Invalid email or password. This user is not registered.");
      }
      
      const { token, user } = await loginUser(email, password);
      localStorage.setItem('token', token);
      setUser(user);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate('/feed');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Sign in failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user already exists
      const users = getRegisteredUsers();
      const existingUser = users.find(user => user.email === email);
      
      if (existingUser) {
        throw new Error("A user with this email already exists");
      }
      
      const { token, user } = await registerUser(name, email, password);
      
      // Store the user credentials for future login validation
      saveRegisteredUser(email, password);
      
      localStorage.setItem('token', token);
      setUser(user);
      
      toast({
        title: "Account created!",
        description: "You've successfully signed up.",
      });
      
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Sign up failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/signin');
    
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
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
        isAuthenticated: !!user,
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
