// src/pages/Alerts.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import SocialLayout from '@/components/layout/SocialLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarking,
    isDeleting,
  } = useNotifications();

  // Handle navigation based on notification type
  const handleNotificationClick = (notification: {
    _id: string;
    type: string;
    post?: { _id: string };
    event?: { _id: string };
    product?: { _id: string };
    conversation?: { _id: string };
    isRead: boolean;
  }) => {
    switch (notification.type) {
      case 'post_like':
      case 'post_comment':
      case 'post_comment_mention':
      case 'comment_like':
        if (notification.post) {
          navigate(`/posts/${notification.post._id}`);
        }
        break;
      case 'event_like':
      case 'event_comment':
      case 'event_interested':
      case 'event_comment_mention':
        if (notification.event) {
          navigate(`/events/${notification.event._id}`);
        }
        break;
      case 'product_like':
      case 'product_comment':
      case 'product_comment_mention':
        if (notification.product) {
          navigate(`/products/${notification.product._id}`);
        }
        break;
      case 'new_message':
        if (notification.conversation) {
          navigate(`/messages/${notification.conversation._id}`);
        }
        break;
      default:
        break;
    }
    // Mark as read when clicked (if unread)
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  if (isLoading) {
    return (
      <SocialLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SocialLayout>
    );
  }

  if (error) {
    return (
      <SocialLayout>
        <div className="max-w-4xl mx-auto p-4">
          <p className="text-red-500">
            Error loading notifications: {(error as Error).message}
          </p>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead()}
              disabled={isMarking}
            >
              {isMarking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Mark All as Read'
              )}
            </Button>
          )}
        </div>
        {notifications.length ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`${import.meta.env.VITE_IMAGE_URL}${notification.sender.avatar}`}
                    alt={notification.sender.username}
                  />
                  <AvatarFallback>
                    {notification.sender.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      notification.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'
                    }`}
                  >
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(parseISO(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation
                        markAsRead(notification._id);
                      }}
                      disabled={isMarking}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation
                      deleteNotification(notification._id);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No notifications found.</p>
        )}
      </div>
    </SocialLayout>
  );
};

export default Alerts;