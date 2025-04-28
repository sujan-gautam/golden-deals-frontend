// src/hooks/use-avatar.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_API_KEY || 'mySuperSecretToken';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

export const useAvatar = (avatarFilename: string | null) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!avatarFilename) return;
      const token = localStorage.getItem('token');
      try {
        const response = await api.get(`/storage/avatars/${avatarFilename}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          responseType: 'blob',
        });
        setAvatarUrl(URL.createObjectURL(response.data));
      } catch (error) {
        console.error('Error fetching avatar:', error);
        toast({ title: 'Error', description: 'Failed to load avatar.', variant: 'destructive' });
      }
    };
    fetchAvatar();
  }, [avatarFilename, toast]);

  return avatarUrl;
};