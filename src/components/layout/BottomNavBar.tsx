import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const queryClient = useQueryClient();

  // List of paths where BottomNavBar should be hidden
  const hiddenPaths = ['/messages/:id']; // Add more paths as needed, e.g., '/settings', '/profile'

  // Check if the current path is in hiddenPaths
  const shouldHideNavBar = hiddenPaths.some((path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // Early return if the navbar should be hidden
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

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/messages', icon: MessageSquare, label: 'Chat' },
    { path: '/marketplace', icon: ShoppingBag, label: '', isCentral: true },
    { path: '/notification', icon: Bell, label: 'Alerts' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <nav className="flex justify-around items-center h-16 px-4 sm:px-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const isProfile = item.path === '/profile';
            const isAlerts = item.path === '/notification';
            const isMessages = item.path === '/messages';
            const hasUser = !!user && isProfile;

            return (
              <div
                key={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-full',
                  'transition-transform duration-200 ease-out',
                  'focus:outline-none focus:ring-2 focus:ring-usm-gold/50',
                  item.isCentral ? 'relative -top-4' : 'hover:scale-105'
                )}
                onClick={isMessages ? handleMessagesClick : undefined}
                role={isMessages ? 'button' : undefined}
                aria-label={item.label || 'Marketplace'}
              >
                {isMessages ? (
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full w-10 h-10 relative',
                      'transition-all duration-200',
                      item.isCentral
                        ? 'bg-usm-gold shadow-md scale-110'
                        : active
                        ? 'bg-usm-gold/10'
                        : 'bg-transparent',
                      hasUser && !active && !item.isCentral ? 'bg-blue-50' : ''
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors duration-200',
                        item.isCentral
                          ? 'text-white'
                          : active
                          ? 'text-usm-gold'
                          : hasUser && isProfile
                          ? 'text-blue-600'
                          : 'text-gray-500',
                        active && !item.isCentral ? 'scale-110' : ''
                      )}
                      aria-hidden="true"
                    />
                    {isMessages && unreadMessageCount > 0 && (
                      <span
                        className={cn(
                          'absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold',
                          'rounded-full h-4 w-4 flex items-center justify-center',
                          'ring-1 ring-white'
                        )}
                        aria-label={`${unreadMessageCount} unread messages`}
                      >
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center justify-center rounded-full w-10 h-10 relative',
                      'transition-all duration-200',
                      item.isCentral
                        ? 'bg-usm-gold shadow-md scale-110'
                        : active
                        ? 'bg-usm-gold/10'
                        : 'bg-transparent',
                      hasUser && !active && !item.isCentral ? 'bg-blue-50' : ''
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors duration-200',
                        item.isCentral
                          ? 'text-white'
                          : active
                          ? 'text-usm-gold'
                          : hasUser && isProfile
                          ? 'text-blue-600'
                          : 'text-gray-500',
                        active && !item.isCentral ? 'scale-110' : ''
                      )}
                      aria-hidden="true"
                    />
                    {isAlerts && unreadCount > 0 && (
                      <span
                        className={cn(
                          'absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold',
                          'rounded-full h-4 w-4 flex items-center justify-center',
                          'ring-1 ring-white'
                        )}
                        aria-label={`${unreadCount} unread notifications`}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {item.label && (
                  <span
                    className={cn(
                      'text-xs font-medium mt-1',
                      active ? 'text-gray-900' : 'text-gray-500',
                      'transition-colors duration-200'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNavBar;