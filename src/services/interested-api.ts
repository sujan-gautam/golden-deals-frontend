
import { fetchAPI } from './api';
import { User } from '@/types/user';
import { EventPost } from '@/types/post';

export const getInterestedEvents = async (): Promise<EventPost[]> => {
  try {
    const response = await fetchAPI('events/interested', {
      method: 'GET',
    });
    console.log('getInterestedEvents response:', response);
    const events = response.data || response;
    return events.map((event: any) => normalizeEvent(event));
  } catch (error: any) {
    console.error('Failed to fetch interested events:', {
      message: error.message,
      stack: error.stack,
      endpoint: 'events/interested',
      status: error.status,
    });
    throw new Error(error.message || 'Failed to fetch interested events');
  }
};

export const normalizeUser = (user: any): User => {
  if (!user || !user._id) {
    console.warn('Invalid user object:', user);
    return {
      _id: '',
      username: user?.username || 'unknown',
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      name: user?.name || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.username || 'Unknown',
    };
  }
  return {
    _id: user._id.toString(),
    username: user.username || 'unknown',
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
    avatar: user.avatar || '',
    name: user.name || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'Unknown',
  };
};

export const normalizeEvent = (event: any, currentUserId?: string): EventPost | null => {
  if (!event || !event._id || !event.event_title || !event.user_id) {
    console.warn('Invalid event object:', event);
    return null;
  }

  const likesArray = Array.isArray(event.likes) ? event.likes : [];
  const interestedArray = Array.isArray(event.interested) ? event.interested : [];
  const isLiked = event.liked ?? (currentUserId ? likesArray.includes(currentUserId) : false);
  const isInterested = event.isInterested ?? (currentUserId ? interestedArray.includes(currentUserId) : false);

  const userId = event.user_id?._id?.toString() || event.user_id || event.user?._id;
  if (!userId) {
    console.warn('Event missing valid user_id:', event);
    return null;
  }

  return {
    _id: event._id.toString(),
    user_id: userId,
    user: {
      _id: userId,
      name: event.user_id?.name || event.user?.name || 'Unknown',
      avatar: event.user_id?.avatar || event.user?.avatar || '',
      username: event.user_id?.username || event.user?.username || 'unknown',
    },
    type: 'event',
    event_title: event.event_title || 'Untitled Event',
    content: event.event_details || '',
    event_date: event.event_date || new Date().toISOString(),
    event_location: event.event_location || 'Unknown Location',
    image: event.image
      ? {
          filename: event.image.filename || '',
          path: event.image.path || '',
          mimetype: event.image.mimetype || '',
        }
      : undefined,
    likes: likesArray,
    likesCount: typeof event.likes === 'number' ? event.likes : likesArray.length,
    liked: isLiked,
    interested: interestedArray,
    interestedCount: typeof event.interested === 'number' ? event.interested : interestedArray.length,
    isInterested: isInterested,
    shares: event.shares || 0,
    comments: event.comments || [],
    createdAt: event.createdAt || new Date().toISOString(),
    updatedAt: event.updatedAt || new Date().toISOString(),
  };
};

export const getUsersInterestedInMyEvents = async (): Promise<{ event: EventPost; interestedUsers: User[] }[]> => {
  try {
    const response = await fetchAPI('events/authored/interested', {
      method: 'GET',
    });
    console.log('getUsersInterestedInMyEvents response:', response);
    const data = response.data || response;
    const normalizedData = data
      .map((item: any) => {
        const normalizedEvent = normalizeEvent(item.event);
        if (!normalizedEvent) {
          console.warn('Skipping invalid event:', item.event);
          return null;
        }
        const validUsers = (item.interestedUsers || [])
          .map((user: any) => normalizeUser(user))
          .filter((user: User) => user._id && user._id !== 'undefined' && user._id !== 'unknown');
        return {
          event: normalizedEvent,
          interestedUsers: validUsers,
        };
      })
      .filter((item: any) => item !== null);
    return normalizedData;
  } catch (error: any) {
    console.error('Failed to fetch users interested in authored events:', error.message);
    throw new Error(error.message || 'Failed to fetch users interested in authored events');
  }
};