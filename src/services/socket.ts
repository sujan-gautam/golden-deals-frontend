import { io, Socket } from 'socket.io-client';
import { getToken } from './authService';

const SOCKET_URL = import.meta.env.VITE_IMAGE_URL;

let socket: Socket | null = null;

export const initializeSocket = (userId: string | undefined): Socket | null => {
  if (!userId) {
    console.warn('No user ID provided for socket initialization');
    return null;
  }

  if (socket && socket.connected) {
    console.log('Reusing socket:', socket.id);
    return socket;
  }

  const token = getToken();
  if (!token) {
    console.warn('No token available for socket connection');
    return null;
  }

  console.log('Initializing socket:', { SOCKET_URL, token: token.slice(0, 10) + '...' });

  socket = io(SOCKET_URL, {
    path: '/socket.io', // Explicitly set to match server
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  });

  socket.on('connect', () => {
    console.log(`Socket connected: ${socket?.id}`);
    socket?.emit('joinUser', userId);
  });

  socket.on('connect_error', (error) => {
    console.error(`Socket connection error: ${error.message}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('reconnect', () => {
    console.log(`Socket reconnected: ${socket?.id}`);
    socket?.emit('joinUser', userId);
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};