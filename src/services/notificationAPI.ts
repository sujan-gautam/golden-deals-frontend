// src/services/notificationAPI.ts
import { fetchAPI } from './api';
import { Notification } from '../types/notification'; // Define type below

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await fetchAPI('notifications');
  return response.data; // Backend returns { message, data: Notification[] }
};

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  const response = await fetchAPI('notifications/unread-count');
  return response.data.count; // Backend returns { message, data: { count: number } }
};

// Mark a single notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await fetchAPI(`notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await fetchAPI('notifications/read-all', {
    method: 'PATCH',
  });
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await fetchAPI(`notifications/${notificationId}`, {
    method: 'DELETE',
  });
};