import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { Message } from '@/types/message';
import { useToast } from '@/components/ui/use-toast';

interface MessagingContextType {
  socket: Socket | null;
  joinConversation: (conversationId: string) => void;
  messages: Message[];
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('Not authenticated or no user, skipping Socket.IO connection');
      return;
    }

    let token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for Socket.IO connection');
      toast({
        title: 'Authentication Error',
        description: 'No token found. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    token = token.replace('Bearer ', '');

    console.log('Connecting to Socket.IO at:', SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server:', newSocket.id);
      newSocket.emit('join_user', user.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
      toast({
        title: 'Connection Error',
        description: `Failed to connect: ${err.message}`,
        variant: 'destructive',
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      // toast({
      //   title: 'Disconnected',
      //   description: `Messaging service disconnected: ${reason}`,
      //   variant: 'destructive',
      // });
    });

    newSocket.on('receive_message', (message: Message) => {
      console.log('Received message in MessagingProvider:', message);
      if (!message._id || !message.conversationId || !message.content) {
        console.warn('Skipping invalid message:', message);
        return;
      }
      setMessages((prev) => {
        if (!prev.some((msg) => msg._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
    });

    setSocket(newSocket);

    return () => {
      console.log('Disconnecting Socket.IO');
      newSocket.disconnect();
    };
  }, [isAuthenticated, user, toast]);

  const joinConversation = (conversationId: string) => {
    if (socket) {
      console.log('Joining conversation:', conversationId);
      socket.emit('join_conversation', conversationId, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log('Successfully joined conversation:', conversationId);
        } else {
          console.error('Failed to join conversation:', response.error);
          toast({
            title: 'Error',
            description: `Failed to join conversation: ${response.error}`,
            variant: 'destructive',
          });
        }
      });
    } else {
      console.error('Cannot join conversation: No socket');
      toast({
        title: 'Error',
        description: 'Messaging service unavailable.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MessagingContext.Provider value={{ socket, joinConversation, messages }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};