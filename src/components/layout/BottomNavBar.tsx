import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, Plus, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import CreatePostModal from '../social/CreatePostModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY ;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hide navbar on specific paths
  const hiddenPaths = ['/messages/'];
  const shouldHideNavBar = hiddenPaths.some((path) =>
    location.pathname === path || location.pathname.startsWith(path)
  );

  if (shouldHideNavBar) {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleMessagesClick = () => {
    if (isAuthenticated && user?.id) {
      queryClient.invalidateQueries({ queryKey: ['unreadMessages', user.id] });
    }
    navigate('/messages');
  };

  const handleNotificationsClick = () => {
    if (isAuthenticated && user?.id) {
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
    }
    navigate('/notification');
  };

  const handleCreateSubmit = async (data: Partial<any>) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      if (data.content) formData.append('content', data.content);
      if (data.image) formData.append('image', data.image);
      if (data.type === 'product') {
        formData.append('title', data.title);
        formData.append('price', data.price.toString());
        formData.append('category', data.category || '');
        formData.append('condition', data.condition);
        formData.append('status', data.status);
      }
      if (data.type === 'event') {
        formData.append('event_title', data.event_title);
        formData.append('event_date', data.event_date);
        formData.append('event_location', data.event_location);
      }

      await api.post('/posts', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { path: '/feed', icon: Home, label: 'Home' },
    { path: '/notification', icon: Bell, label: 'Notifications', onClick: handleNotificationsClick },
    { path: '#create', icon: Plus, label: 'Create', onClick: () => setIsCreateModalOpen(true), isCentral: true },
    { path: '/messages', icon: MessageSquare, label: 'Messages', onClick: handleMessagesClick },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-md">
          <nav className="flex justify-between items-center h-17 px-3">
            {navItems.map((item) => {
              const active = isActive(item.path) && item.path !== '#create';
              const Icon = item.icon;
              const isMessages = item.path === '/messages';
              const isNotifications = item.path === '/notification';
              const isCentral = item.isCentral;

              return (
                <div
                  key={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center w-1/5 h-full',
                    'transition-all duration-200 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-usm-gold/30'
                  )}
                  onClick={item.onClick}
                  role={item.onClick ? 'button' : undefined}
                  aria-label={item.label}
                >
                  {item.onClick ? (
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 relative rounded-full',
                        'transition-all duration-200',
                        isCentral
                          ? isCreateModalOpen
                            ? 'bg-usm-gold/20'
                            : 'bg-white'
                          : active
                          ? 'bg-gray-50 rounded-lg'
                          : 'bg-transparent',
                        isCentral && 'hover:bg-usm-gold/20'
                      )}
                    >
                      <Icon
                        className={cn(
                          'transition-colors duration-200',
                          isCentral ? 'h-6 w-6' : 'h-5 w-5',
                          isCentral
                            ? isCreateModalOpen
                              ? 'text-usm-gold'
                              : 'text-gray-800'
                            : active
                            ? 'text-usm-gold'
                            : 'text-gray-700'
                        )}
                        aria-hidden="true"
                      />
                      {(isMessages && unreadMessageCount > 0) || (isNotifications && unreadCount > 0) ? (
                        <span
                          className={cn(
                            'absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium',
                            'rounded-full h-4 w-4 flex items-center justify-center',
                            'ring-1 ring-white'
                          )}
                          aria-label={
                            isMessages
                              ? `${unreadMessageCount} unread messages`
                              : `${unreadCount} unread notifications`
                          }
                        >
                          {isMessages
                            ? unreadMessageCount > 9
                              ? '9+'
                              : unreadMessageCount
                            : unreadCount > 9
                            ? '9+'
                            : unreadCount}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center justify-center w-10 h-10 relative',
                        'transition-all duration-200',
                        active ? 'bg-gray-50 rounded-lg' : 'bg-transparent'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors duration-200',
                          active ? 'text-usm-gold' : 'text-gray-700'
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                  <span
                    className={cn(
                      'text-[11px] font-light tracking-tight mt-1',
                      active || (isCentral && isCreateModalOpen)
                        ? 'text-usm-gold font-medium'
                        : 'text-gray-600',
                      'transition-colors duration-200'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        initialType="post"
        isLoading={isSubmitting}
      />
    </>
  );
};

export default BottomNavBar;