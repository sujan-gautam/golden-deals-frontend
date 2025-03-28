
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/user';
import { loginUser, registerUser } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();
        
        if (token && currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        authService.clearAuthData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const updateUserProfile = (userData: Partial<User>) => {
    try {
      const updatedUser = authService.updateUserProfile(userData);
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user exists in our registered users
      if (!authService.isRegisteredUser(email, password)) {
        throw new Error("Invalid email or password. This user is not registered.");
      }
      
      const response = await loginUser(email, password);
      authService.saveAuthData(response);
      setUser(response.user);
      
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
      const users = authService.getRegisteredUsers();
      const existingUser = users.find(user => user.email === email);
      
      if (existingUser) {
        throw new Error("A user with this email already exists");
      }
      
      const response = await registerUser(name, email, password);
      
      // Store the user credentials for future login validation
      authService.saveRegisteredUser(email, password);
      authService.saveAuthData(response);
      setUser(response.user);
      
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
    authService.clearAuthData();
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
        updateUserProfile
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
