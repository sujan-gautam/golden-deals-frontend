import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationAPI';
import { getConversations } from '../services/api'; // Import getConversations
import { initializeSocket, disconnectSocket } from '../services/socket';
import { Notification } from '../types/notification';
import { Button } from '@/components/ui/button';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnectSocket();
      return;
    }

    const socket = initializeSocket(user.id);
    if (!socket) {
      // toast({
      //   title: 'Notification Error',
      //   description: 'Failed to initialize real-time notifications.',
      //   variant: 'destructive',
      // });
      return;
    }

    socket.on('connect', () => {
      console.log(`Socket connected in useNotifications: ${socket.id}`);
    });

    socket.on(`notification:user:${user.id}`, (notification: Notification) => {
      console.log('useNotifications: Received notification:', notification);
      queryClient.setQueryData<Notification[]>(['notifications', user.id], (old = []) => {
        if (old.some((n) => n._id === notification._id)) {
          console.log('useNotifications: Duplicate notification ignored:', notification._id);
          return old;
        }
        return [notification, ...old];
      });

      if (!notification.isRead) {
        // Update notification count
        queryClient.setQueryData<number>(['unreadNotifications', user.id], (old = 0) => {
          console.log(`useNotifications: Incrementing unreadNotifications from ${old} to ${old + 1}`);
          return old + 1;
        });

        // Update message count for new_message notifications
        if (notification.type === 'new_message') {
          queryClient.setQueryData<number>(['unreadMessages', user.id], (old = 0) => {
            console.log(`useNotifications: Incrementing unreadMessages from ${old} to ${old + 1}`);
            return old + 1;
          });
        }
      }

      if (location.pathname !== '/notification') {
        // toast({
        //   title: notification.type === 'new_message' ? 'New Message' : 'New Notification',
        //   description: notification.content,
        //   action: (
        //     <Button
        //       variant="outline"
        //       size="sm"
        //       onClick={() => (window.location.href = '/notification')}
        //     >
        //       View
        //     </Button>
        //   ),
        // });
      }
    });

    socket.on('connect_error', (error) => {
      console.error(`Socket connect_error in useNotifications: ${error.message}`);
      // toast({
      //   title: 'Notification Error',
      //   description: `Failed to connect to real-time notifications: ${error.message}. Retrying...`,
      //   variant: 'destructive',
      // });
    });

    return () => {
      disconnectSocket();
    };
  }, [user?.id, isAuthenticated, queryClient, location.pathname, toast]);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: getNotifications,
    enabled: isAuthenticated && !!user?.id,
    initialData: [],
  });

  const unreadCountQuery = useQuery({
    queryKey: ['unreadNotifications', user?.id],
    queryFn: getUnreadCount,
    enabled: isAuthenticated && !!user?.id,
    initialData: 0,
  });

  // New query for unread message count
  const unreadMessagesQuery = useQuery({
    queryKey: ['unreadMessages', user?.id],
    queryFn: async () => {
      const conversations = await getConversations();
      const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      console.log(`useNotifications: Fetched unreadMessages: ${totalUnread}`);
      return totalUnread;
    },
    enabled: isAuthenticated && !!user?.id,
    initialData: 0,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications', user?.id] });
      // Invalidate message count if the notification was a new_message
      queryClient.invalidateQueries({ queryKey: ['unreadMessages', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to mark notification as read: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessages', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to mark all notifications as read: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessages', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    notifications: notificationsQuery.data,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error as Error | null,
    unreadCount: unreadCountQuery.data,
    unreadMessageCount: unreadMessagesQuery.data, // Expose unreadMessageCount
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarking: markAsReadMutation.isLoading || markAllAsReadMutation.isLoading,
    isDeleting: deleteNotificationMutation.isLoading,
  };
};