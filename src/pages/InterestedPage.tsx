import React, { useState, Component, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp } from 'lucide-react';
import SocialLayout from '@/components/layout/SocialLayout';
import PostTypeDisplay from '@/components/social/PostTypeDisplay';
import InterestedUsersDisplay from '@/components/social/InterestedUsersDisplay';
import { useInterestedEvents } from '@/hooks/use-interested-events';
import { EventPost, Post } from '@/types/post';
import { User } from '@/types/user';
import { usePosts } from '@/hooks/use-posts';

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL ;

// Error Boundary (unchanged)
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-gray-600 mt-2">{this.state.error?.message || 'An error occurred.'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const InterestedPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'interested' | 'created'>('interested');
  const { handleLikePost, handleSharePost, handleInterestedInEvent } = usePosts();
  const {
    interestedEvents,
    authoredEventsWithInterestedUsers,
    isLoading,
    error,
    refetchInterestedEvents,
  } = useInterestedEvents();

  // Log API data for debugging
  console.log('InterestedPage - interestedEvents:', interestedEvents);
  console.log('InterestedPage - authoredEventsWithInterestedUsers:', authoredEventsWithInterestedUsers);

  // Combine events for filtering
  const events = [
    ...interestedEvents.map((event) => ({ event, type: 'interested', interestedUsers: [] as User[] })),
    ...authoredEventsWithInterestedUsers.map(({ event, interestedUsers }) => ({
      event,
      type: 'created',
      interestedUsers: interestedUsers
        .filter((u) => {
          const isValid = u._id && u._id !== 'undefined' && u._id !== 'unknown';
          if (!isValid) {
            console.warn('Invalid user in interestedUsers:', u);
          }
          return isValid;
        })
        .map((u) => ({
          _id: u._id?.toString() || '',
          username: u.username || 'unknown',
          firstname: u.firstname || '',
          lastname: u.lastname || '',
          email: u.email || '',
          avatar: u.avatar ? (u.avatar.startsWith('http') ? u.avatar : `${IMAGE_URL}${u.avatar}`) : '',
          name: u.name || `${u.firstname || ''} ${u.lastname || ''}`.trim() || u.username || 'Unknown',
        })),
    })),
  ];

  // Filter events based on active tab
  const filteredEvents = events.filter(({ event, type }) => {
    const isValid =
      event._id &&
      event._id !== 'undefined' &&
      event.event_title &&
      (event.user_id || event.user?._id) &&
      (activeTab === 'interested' && type === 'interested' || activeTab === 'created' && type === 'created');
    if (!isValid) {
      console.warn('Invalid event filtered out:', event);
    }
    return isValid;
  });

  const counts = {
    interested: interestedEvents.length,
    created: authoredEventsWithInterestedUsers.length,
  };

  // Handle like
  const handleLike = async (eventId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in to like events.',
        variant: 'destructive',
      });
      return;
    }

    const previousData = queryClient.getQueryData(['interestedEvents', user.id]);
    queryClient.setQueryData(['interestedEvents', user.id], (old: any) =>
      old
        ? {
            interestedEvents: old.interestedEvents.map((event: EventPost) =>
              event._id === eventId
                ? {
                    ...event,
                    likes: Array.isArray(event.likes)
                      ? event.liked
                        ? event.likes.filter((id: string) => id !== user.id)
                        : [...event.likes, user.id]
                      : event.liked
                      ? []
                      : [user.id],
                    liked: !event.liked,
                  }
                : event
            ),
            authoredEventsWithInterestedUsers: old.authoredEventsWithInterestedUsers.map(
              ({ event, interestedUsers }: { event: EventPost; interestedUsers: User[] }) =>
                event._id === eventId
                  ? {
                      event: {
                        ...event,
                        likes: Array.isArray(event.likes)
                          ? event.liked
                            ? event.likes.filter((id: string) => id !== user.id)
                            : [...event.likes, user.id]
                          : event.liked
                          ? []
                          : [user.id],
                        liked: !event.liked,
                      },
                      interestedUsers,
                    }
                  : { event, interestedUsers }
            ),
          }
        : old
    );

    try {
      await handleLikePost(eventId);
    } catch (error: any) {
      queryClient.setQueryData(['interestedEvents', user.id], previousData);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to like event.',
        variant: 'destructive',
      });
    }
  };

  // Handle interested
  const handleInterested = async (eventId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in to mark interest.',
        variant: 'destructive',
      });
      return;
    }

    const previousData = queryClient.getQueryData(['interestedEvents', user.id]);
    queryClient.setQueryData(['interestedEvents', user.id], (old: any) =>
      old
        ? {
            interestedEvents: old.interestedEvents.map((event: EventPost) =>
              event._id === eventId
                ? {
                    ...event,
                    interested: Array.isArray(event.interested)
                      ? event.isInterested
                        ? event.interested.filter((id: string) => id !== user.id)
                        : [...event.interested, user.id]
                      : event.isInterested
                      ? []
                      : [user.id],
                    isInterested: !event.isInterested,
                  }
                : event
            ),
            authoredEventsWithInterestedUsers: old.authoredEventsWithInterestedUsers.map(
              ({ event, interestedUsers }: { event: EventPost; interestedUsers: User[] }) =>
                event._id === eventId
                  ? {
                      event: {
                        ...event,
                        interested: Array.isArray(event.interested)
                          ? event.isInterested
                            ? event.interested.filter((id: string) => id !== user.id)
                            : [...event.interested, user.id]
                          : event.isInterested
                          ? []
                          : [user.id],
                        isInterested: !event.isInterested,
                      },
                      interestedUsers: event.isInterested
                        ? interestedUsers.filter((u) => u._id !== user.id)
                        : [
                            ...interestedUsers,
                            {
                              _id: user.id,
                              username: user.username,
                              firstname: user.firstname,
                              lastname: user.lastname,
                              email: user.email || '',
                              avatar: user.avatar,
                              name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username,
                            },
                          ],
                    }
                  : { event, interestedUsers }
            ),
          }
        : old
    );

    try {
      await handleInterestedInEvent(eventId);
    } catch (error: any) {
      queryClient.setQueryData(['interestedEvents', user.id], previousData);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle interest.',
        variant: 'destructive',
      });
    }
  };

  // Handle share
  const handleShare = async (eventId: string) => {
    const shareUrl = `${window.location.origin}/events/${eventId}`;
    queryClient.setQueryData(['interestedEvents', user?.id], (old: any) =>
      old
        ? {
            interestedEvents: old.interestedEvents.map((event: EventPost) =>
              event._id === eventId
                ? { ...event, shares: (Number(event.shares) || 0) + 1 }
                : event
            ),
            authoredEventsWithInterestedUsers: old.authoredEventsWithInterestedUsers.map(
              ({ event, interestedUsers }: { event: EventPost; interestedUsers: User[] }) =>
                event._id === eventId
                  ? {
                      event: { ...event, shares: (Number(event.shares) || 0) + 1 },
                      interestedUsers,
                    }
                  : { event, interestedUsers }
            ),
          }
        : old
    );

    try {
      await handleSharePost(eventId);
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Success',
        description: 'Event link copied to clipboard.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to share event.',
        variant: 'destructive',
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <SocialLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your events.</p>
            <Button onClick={() => navigate('/signin')}>Sign In</Button>
          </Card>
        </div>
      </SocialLayout>
    );
  }

  return (
    <ErrorBoundary>
      <SocialLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Button
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-900"
            onClick={handleBackToHome}
          >
            <ArrowUp className="h-4 w-4 mr-2 rotate-270" />
            Back to Home
          </Button>

          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Events</h1>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'interested' | 'created')}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="interested" className="text-sm font-medium">
                My Interested Events ({counts.interested})
              </TabsTrigger>
              <TabsTrigger value="created" className="text-sm font-medium">
                My Created Events ({counts.created})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="p-4">
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Failed to Load Events</h2>
              <p className="text-gray-600 mb-6">Unable to load your events. Please try again.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => refetchInterestedEvents()}>Retry</Button>
                <Button variant="outline" onClick={handleBackToHome}>
                  Back to Home
                </Button>
              </div>
            </Card>
          )}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No {activeTab === 'interested' ? 'Interested Events' : 'Created Events'}
              </h2>
              <p className="text-gray-600 mb-6">
                {activeTab === 'interested'
                  ? "You haven't marked interest in any events yet."
                  : "You haven't created any events yet."}
              </p>
              <Button onClick={handleBackToHome}>Explore More</Button>
            </Card>
          )}

          {!isLoading && !error && filteredEvents.length > 0 && (
            <div className="space-y-6">
              {filteredEvents.map(({ event, type, interestedUsers }) => {
                const userId = user?.id?.toString();

                // Normalize likes and interested arrays
                const likesArray = Array.isArray(event.likes)
                  ? event.likes
                      .map((l) =>
                        typeof l === 'object' && l !== null ? l._id?.toString() || l.id?.toString() : l?.toString()
                      )
                      .filter(Boolean)
                  : [];
                const interestedArray = Array.isArray(event.interested)
                  ? event.interested
                      .map((i) =>
                        typeof i === 'object' && i !== null ? i._id?.toString() || i.id?.toString() : i?.toString()
                      )
                      .filter(Boolean)
                  : [];

                const likesCount = typeof event.likes === 'number' ? event.likes : likesArray.length;
                const interestedCount = typeof event.interested === 'number' ? event.interested : interestedArray.length;

                const isLiked = userId ? likesArray.includes(userId) : false;
                const isInterested = userId ? interestedArray.includes(userId) : false;

                const normalizedPost: Post = {
                  _id: event._id,
                  type: 'event',
                  userId: typeof event.user_id === 'string' ? event.user_id : event.user?._id || event.user_id?._id || 'unknown',
                  user: {
                    _id: typeof event.user_id === 'string' ? event.user_id : event.user?._id || event.user_id?._id || 'unknown',
                    name:
                      event.user_id && typeof event.user_id !== 'string'
                        ? `${event.user_id.firstname || ''} ${event.user_id.lastname || ''}`.trim() ||
                          event.user_id.username ||
                          'Unknown'
                        : event.user
                        ? `${event.user.firstname || ''} ${event.user.lastname || ''}`.trim() || event.user.username || 'Unknown'
                        : 'Unknown',
                    avatar:
                      (event.user_id && typeof event.user_id !== 'string' && event.user_id.avatar) ||
                      (event.user && event.user.avatar)
                        ? (event.user_id && typeof event.user_id !== 'string' ? event.user_id.avatar : event.user?.avatar)?.startsWith('http')
                          ? (event.user_id && typeof event.user_id !== 'string' ? event.user_id.avatar : event.user?.avatar)
                          : `${IMAGE_URL}${(event.user_id && typeof event.user_id !== 'string' ? event.user_id.avatar : event.user?.avatar) || ''}`
                        : null,
                  },
                  content: event.event_details || event.content || '',
                  image: event.image
                    ? {
                        filename: event.image.filename || '',
                        path: event.image.path?.startsWith('http') ? event.image.path : `${IMAGE_URL}${event.image.path || ''}`,
                        mimetype: event.image.mimetype || '',
                      }
                    : undefined,
                  likes: likesCount,
                  liked: isLiked,
                  shares: Number(event.shares) || 0,
                  comments: Array.isArray(event.comments) ? event.comments : [],
                  createdAt: event.createdAt || new Date().toISOString(),
                  updatedAt: event.updatedAt || new Date().toISOString(),
                  event_title: event.event_title || 'Untitled Event',
                  event_date: event.event_date || new Date().toISOString(),
                  event_location: event.event_location || 'Unknown Location',
                  interested: interestedCount,
                  isInterested: isInterested,
                };

                return (
                  <div
                    key={event._id}
                    className="py-4" // Added padding for spacing without Card
                  >
                    <PostTypeDisplay
                      post={normalizedPost}
                      onLike={() => handleLike(event._id)}
                      onShare={() => handleShare(event._id)}
                      onInterested={() => handleInterested(event._id)}
                      currentUser={
                        user
                          ? {
                              _id: user.id,
                              username: user.username,
                              firstname: user.firstname,
                              lastname: user.lastname,
                              avatar: user.avatar ? `${IMAGE_URL}${user.avatar}` : null,
                            }
                          : undefined
                      }
                    />
                    {type === 'created' && activeTab === 'created' && (
                      <InterestedUsersDisplay
                        interestedUsers={interestedUsers}
                        eventTitle={event.event_title}
                        eventId={event._id}
                        eventInterested={interestedCount}
                        eventIsInterested={isInterested}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SocialLayout>
    </ErrorBoundary>
  );
};

export default InterestedPage;