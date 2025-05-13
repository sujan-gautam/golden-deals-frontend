import React, { useState, Component, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { getSavedItems, unsaveItem } from '@/services/savedItem-api';
import { SavedItem } from '@/types/savedItem';
import { Post, ProductPost, EventPost } from '@/types/post';
import { usePosts } from '@/hooks/use-posts';

// Use Vite environment variables for image URL (aligned with usePosts)
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

// Error Boundary
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

const Saved: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'post' | 'product' | 'event'>('all');

  // Use usePosts hook for like, share, and interested actions
  const { handleLikePost, handleSharePost, handleInterestedInEvent } = usePosts();

  // Fetch saved items
  const { data: savedItems = [], isLoading, isError, refetch } = useQuery<SavedItem[]>({
    queryKey: ['savedItems'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('AUTH_REQUIRED');
      const data = await getSavedItems();
      console.log('Fetched saved items:', data);
      return Array.isArray(data) ? data : data.data || [];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (err: any) => {
      console.error('Query error for savedItems:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load saved items.',
        variant: 'destructive',
      });
    },
  });

  // Filter and validate items
  const filteredItems = savedItems
    .filter((item) => {
      const isValid =
        item.item?._id &&
        item.item_type &&
        item.item._id !== 'undefined' &&
        ['post', 'product', 'event'].includes(item.item_type) &&
        (item.item.user_id || item.item.user?._id);
      if (!isValid) {
        console.warn('Invalid saved item filtered out:', item);
      }
      return isValid;
    })
    .filter((item) => activeTab === 'all' || item.item_type === activeTab);

  // Count items for each tab
  const counts = {
    all: savedItems.length,
    post: savedItems.filter((item) => item.item_type === 'post').length,
    product: savedItems.filter((item) => item.item_type === 'product').length,
    event: savedItems.filter((item) => item.item_type === 'event').length,
  };

  // Handle unsaving an item
  const handleUnsaveItem = async (savedItemId: string) => {
    try {
      await unsaveItem(savedItemId);
      queryClient.setQueryData<SavedItem[]>(['savedItems'], (old = []) =>
        old.filter((item) => item._id !== savedItemId)
      );
      toast({
        title: 'Item Unsaved',
        description: 'The item has been removed from your saved items.',
      });
    } catch (error: any) {
      console.error('Error unsaving item:', error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unsave item.',
        variant: 'destructive',
      });
    }
  };

  // Handle like with optimistic update for savedItems
  const handleLike = async (postId: string, type: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please sign in to like items.',
        variant: 'destructive',
      });
      return;
    }

    // Optimistically update savedItems
    const previousItems = queryClient.getQueryData<SavedItem[]>(['savedItems']) || [];
    queryClient.setQueryData<SavedItem[]>(['savedItems'], (old = []) =>
      old.map((savedItem) =>
        savedItem.item._id === postId && savedItem.item_type === type
          ? {
              ...savedItem,
              item: {
                ...savedItem.item,
                likes: Array.isArray(savedItem.item.likes)
                  ? savedItem.item.liked
                    ? savedItem.item.likes.filter((id) => id !== user?.id)
                    : [...savedItem.item.likes, user?.id]
                  : savedItem.item.liked
                  ? []
                  : [user?.id],
                liked: !savedItem.item.liked,
              },
            }
          : savedItem
      )
    );

    try {
      await handleLikePost(postId);
    } catch (error: any) {
      queryClient.setQueryData<SavedItem[]>(['savedItems'], previousItems);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to like ${type}.`,
        variant: 'destructive',
      });
    }
  };

  // Handle interested with optimistic update for savedItems
  const handleInterested = async (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please sign in to mark interest.',
        variant: 'destructive',
      });
      return;
    }

    // Optimistically update savedItems
    const previousItems = queryClient.getQueryData<SavedItem[]>(['savedItems']) || [];
    queryClient.setQueryData<SavedItem[]>(['savedItems'], (old = []) =>
      old.map((savedItem) =>
        savedItem.item._id === eventId && savedItem.item_type === 'event'
          ? {
              ...savedItem,
              item: {
                ...savedItem.item,
                interested: Array.isArray((savedItem.item as EventPost).interested)
                  ? (savedItem.item as EventPost).isInterested
                    ? (savedItem.item as EventPost).interested.filter((id) => id !== user?.id)
                    : [...(savedItem.item as EventPost).interested, user?.id]
                  : (savedItem.item as EventPost).isInterested
                  ? []
                  : [user?.id],
                isInterested: !(savedItem.item as EventPost).isInterested,
              },
            }
          : savedItem
      )
    );

    try {
      await handleInterestedInEvent(eventId);
    } catch (error: any) {
      queryClient.setQueryData<SavedItem[]>(['savedItems'], previousItems);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle interest.',
        variant: 'destructive',
      });
    }
  };

  // Handle share with optimistic update for savedItems
  const handleShare = async (postId: string, type: string) => {
    const shareUrl = `${window.location.origin}/${type}s/${postId}`;
    // Optimistically update savedItems
    queryClient.setQueryData<SavedItem[]>(['savedItems'], (old = []) =>
      old.map((savedItem) =>
        savedItem.item._id === postId && savedItem.item_type === type
          ? {
              ...savedItem,
              item: {
                ...savedItem.item,
                shares: (Number(savedItem.item.shares) || 0) + 1,
              },
            }
          : savedItem
      )
    );

    try {
      await handleSharePost(postId);
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} link copied to clipboard.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to share content.',
        variant: 'destructive',
      });
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <SocialLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your saved items.</p>
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

          <h1 className="text-3xl font-bold mb-6 text-gray-800">Saved Items</h1>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="all" className="text-sm font-medium">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="post" className="text-sm font-medium">
                Posts ({counts.post})
              </TabsTrigger>
              <TabsTrigger value="product" className="text-sm font-medium">
                Products ({counts.product})
              </TabsTrigger>
              <TabsTrigger value="event" className="text-sm font-medium">
                Events ({counts.event})
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

          {isError && (
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Failed to Load Saved Items
              </h2>
              <p className="text-gray-600 mb-6">
                Unable to load your saved items. Please try again.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => refetch()}>Retry</Button>
                <Button variant="outline" onClick={handleBackToHome}>
                  Back to Home
                </Button>
              </div>
            </Card>
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No Saved {activeTab === 'all' ? 'Items' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's'}
              </h2>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all'
                  ? "You haven't saved any items yet."
                  : `You haven't saved any ${activeTab}s yet.`}
              </p>
              <Button onClick={handleBackToHome}>Explore More</Button>
            </Card>
          )}

          {!isLoading && !isError && filteredItems.length > 0 && (
            <div className="space-y-6">
              {filteredItems.map((savedItem) => {
                const item = savedItem.item as Post | ProductPost | EventPost;
                const userId = user?.id?.toString();

                // Normalize likes and interested arrays (aligned with usePosts)
                const likesArray = Array.isArray(item.likes)
                  ? item.likes
                      .map((l) =>
                        typeof l === 'object' && l !== null ? l._id?.toString() || l.id?.toString() : l?.toString()
                      )
                      .filter(Boolean)
                  : [];
                const interestedArray =
                  savedItem.item_type === 'event' && Array.isArray((item as EventPost).interested)
                    ? (item as EventPost).interested
                        .map((i) =>
                          typeof i === 'object' && i !== null ? i._id?.toString() || i.id?.toString() : i?.toString()
                        )
                        .filter(Boolean)
                    : [];

                // Compute like and interested counts (aligned with Feed.tsx)
                const likesCount = typeof item.likes === 'number' ? item.likes : likesArray.length;
                const interestedCount =
                  savedItem.item_type === 'event' && typeof (item as EventPost).interested === 'number'
                    ? (item as EventPost).interested
                    : interestedArray.length;

                // Determine liked and isInterested (aligned with usePosts)
                const isLiked = userId ? likesArray.includes(userId) : false;
                const isInterested = userId && savedItem.item_type === 'event' ? interestedArray.includes(userId) : false;

                // Normalize SavedItem to Post type (aligned with Feed.tsx)
                const normalizedPost: Post = {
                  _id: item._id,
                  type: savedItem.item_type as 'post' | 'product' | 'event',
                  userId: typeof item.user_id === 'string' ? item.user_id : item.user?._id || item.user_id?._id || 'unknown',
                  user: {
                    _id: typeof item.user_id === 'string' ? item.user_id : item.user?._id || item.user_id?._id || 'unknown',
                    name:
                      item.user_id && typeof item.user_id !== 'string'
                        ? `${item.user_id.firstname || ''} ${item.user_id.lastname || ''}`.trim() ||
                          item.user_id.username ||
                          'Unknown'
                        : item.user
                        ? `${item.user.firstname || ''} ${item.user.lastname || ''}`.trim() || item.user.username || 'Unknown'
                        : 'Unknown',
                    avatar:
                      (item.user_id && typeof item.user_id !== 'string' && item.user_id.avatar) || (item.user && item.user.avatar)
                        ? `${IMAGE_URL}${
                            (item.user_id && typeof item.user_id !== 'string' ? item.user_id.avatar : item.user?.avatar) || ''
                          }`
                        : '',
                  },
                  content:
                    savedItem.item_type === 'post'
                      ? (item as Post).content || ''
                      : savedItem.item_type === 'product'
                      ? (item as ProductPost).description || (item as ProductPost).content || ''
                      : (item as EventPost).event_details || (item as EventPost).content || '',
                  image: item.image
                    ? {
                        filename: item.image.filename || '',
                        path: item.image.path?.startsWith('http') ? item.image.path : `${IMAGE_URL}${item.image.path || ''}`,
                        mimetype: item.image.mimetype || '',
                      }
                    : undefined,
                  likes: likesCount,
                  liked: isLiked,
                  shares: Number(item.shares) || 0,
                  comments: Array.isArray(item.comments) ? item.comments : [],
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: item.updatedAt || new Date().toISOString(),
                  ...(savedItem.item_type === 'post' && {
                    content: (item as Post).content || '',
                  }),
                  ...(savedItem.item_type === 'product' && {
                    title: (item as ProductPost).title || 'Untitled',
                    price: Number((item as ProductPost).price) || 0,
                    category: (item as ProductPost).category || '',
                    condition: (item as ProductPost).condition || 'new',
                    status: (item as ProductPost).status || 'instock',
                  }),
                  ...(savedItem.item_type === 'event' && {
                    event_title: (item as EventPost).event_title || 'Untitled Event',
                    event_date: (item as EventPost).event_date || new Date().toISOString(),
                    event_location: (item as EventPost).event_location || 'Unknown Location',
                    interested: interestedCount,
                    isInterested: isInterested,
                  }),
                };

                return (
                  <PostTypeDisplay
                    key={savedItem._id}
                    post={normalizedPost}
                    onLike={() => handleLike(item._id, savedItem.item_type)}
                    onShare={() => handleShare(item._id, savedItem.item_type)}
                    onInterested={
                      savedItem.item_type === 'event' ? () => handleInterested(item._id) : undefined
                    }
                    currentUser={
                      user
                        ? {
                            _id: user.id,
                            username: user.username,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            avatar: user.avatar ? `${IMAGE_URL}${user.avatar}` : '',
                          }
                        : undefined
                    }
                    onDelete={() => handleUnsaveItem(savedItem._id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </SocialLayout>
    </ErrorBoundary>
  );
};

export default Saved;