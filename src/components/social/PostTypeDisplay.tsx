// PostTypeDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  Share,
  MoreVertical,
  MessageCircle,
  Calendar,
  MapPin,
  ShoppingBag,
  DollarSign,
  Info,
  ThumbsUp,
  Users,
  Edit,
  Trash,
  Eye,
  X,
  Bookmark,
} from 'lucide-react';
import BrandedLikeButton from './BrandedLikeButton';
import CommentModal from './CommentModal';
import MessageSellerModal from './MessageSellerModal';
import { formatDistance } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../hooks/use-auth';
import { saveItem, unsaveItem, getSavedItems } from '../../services/savedItem-api';
import { useQueryClient } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;



const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

const CustomModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/80 text-gray-800 hover:bg-white hover:text-gray-900 rounded-full shadow-md border border-gray-200 transition-all duration-200 p-2"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

interface User {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  avatar?: string | null;
  location?: string | null;
  name?: string;
}

interface Image {
  path?: string;
  filename?: string;
  mimetype?: string;
  _id?: string;
}

interface Post {
  _id: string;
  type: 'post';
  user_id?: string | { _id: string; username: string; avatar?: string };
  user?: User;
  content: string;
  image?: Image | string;
  likes: number;
  liked: boolean;
  shares: number;
  comments: any[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProductPost {
  _id: string;
  type: 'product';
  user_id?: string | { _id: string; username: string; avatar?: string };
  user?: User;
  title?: string;
  content: string;
  price?: number;
  category?: string;
  condition?: string;
  status?: string;
  image?: Image | string;
  likes: number;
  liked: boolean;
  shares: number;
  comments: any[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface EventPost {
  _id: string;
  type: 'event';
  user_id?: string | { _id: string; username: string; avatar?: string };
  user?: User;
  event_title: string;
  content: string;
  event_date: string | Date;
  event_location: string;
  image?: Image | string;
  likes: number;
  liked: boolean;
  interested: number;
  isInterested: boolean;
  shares: number;
  comments: any[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

type PostDisplayType = Post | ProductPost | EventPost;

interface PostTypeDisplayProps {
  post: PostDisplayType;
  onLike: () => void;
  onComment?: (content?: string) => void;
  onShare?: () => void;
  onInterested?: () => void;
  currentUser?: User;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, updatedPost: Partial<PostDisplayType>) => void;
}

const PostTypeDisplay: React.FC<PostTypeDisplayProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onInterested,
  currentUser,
  onDelete,
  onEdit,
}) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [displayContent, setDisplayContent] = useState(post.content);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Add state for optimistic updates
  const [isInterested, setIsInterested] = useState((post as EventPost).isInterested || false);
  const [interestedCount, setInterestedCount] = useState((post as EventPost).interested || 0);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Log post details to debug type
  console.log('PostTypeDisplay post:', {
    id: post._id,
    type: post.type,
    title: (post as ProductPost).title || (post as EventPost).event_title,
    content: post.content,
    user_id: post.user_id,
    user: post.user,
    isInterested,
    interestedCount,
  });

  // Normalize post type
  const postType = post.type?.trim().toLowerCase() as 'post' | 'product' | 'event';

  // Check saved status
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsSaved(false);
        setSavedItemId(null);
        return;
      }
      try {
        console.log(`Checking saved status for ${postType} ${post._id}`);
        const response = await getSavedItems();
        const savedItems = response.data || response;
        console.log('Saved items received:', savedItems);
        const savedItem = savedItems.find(
          (item: any) => item.item?._id === post._id && item.item_type === postType
        );
        setIsSaved(!!savedItem);
        setSavedItemId(savedItem ? savedItem._id : null);
      } catch (error: any) {
        console.error('Error checking saved status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved status.',
          variant: 'destructive',
        });
      }
    };
    checkSavedStatus();
  }, [post._id, postType, isAuthenticated, currentUser, toast]);

  // Handle save/unsave
  const handleSaveToggle = async () => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to save items.',
        variant: 'destructive',
      });
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved && savedItemId) {
        await unsaveItem(savedItemId);
        setIsSaved(false);
        setSavedItemId(null);
        toast({
          title: 'Item Unsaved',
          description: `${postType.charAt(0).toUpperCase() + postType.slice(1)} has been removed from your saved items.`,
        });
      } else {
        const savedItem = await saveItem(postType as 'post' | 'product' | 'event', post._id);
        setIsSaved(true);
        setSavedItemId(savedItem._id);
        toast({
          title: 'Item Saved',
          description: `${postType.charAt(0).toUpperCase() + postType.slice(1)} has been saved.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isSaved ? 'unsave' : 'save'} ${postType}.`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      let userId: string | undefined;
      if (typeof post.user_id === 'object' && post.user_id?._id) {
        userId = post.user_id._id;
      } else if (typeof post.user_id === 'string') {
        userId = post.user_id;
      } else if (post.user?._id) {
        userId = post.user._id;
      }

      console.log('fetchUser - userId:', userId, 'post.user:', post.user);

      if (!userId || userId === 'unknown') {
        console.warn('No valid user ID provided, using fallback:', post);
        setFetchedUser(post.user || { username: 'Unknown User', _id: 'unknown' });
        setIsFetchingUser(false);
        return;
      }

      if (post.user && post.user.username && post.user._id === userId) {
        console.log('Using existing post.user:', post.user);
        setFetchedUser(post.user);
        setIsFetchingUser(false);
        return;
      }

      try {
        setIsFetchingUser(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': API_KEY,
          },
        };

        console.log('Fetching user with config:', config);
        const response = await api.get(`/users/${userId}`, config);
        const userData: User = response.data;
        console.log('Fetched user:', userData);
        setFetchedUser(userData);
      } catch (error: any) {
        console.error('Error fetching user:', error.message, error.response?.data);
        setFetchedUser(post.user || { username: 'Unknown User', _id: userId });
        toast({
          title: 'Error',
          description: 'Failed to fetch user data. Displaying default information.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingUser(false);
      }
    };

    fetchUser();
  }, [post.user_id, post.user, toast]);

  const getDisplayName = (user: User | null | undefined): string => {
    if (!user || typeof user !== 'object') return 'Unknown User';
    return (
      user.username?.trim() ||
      `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
      user.name?.trim() ||
      (user._id || user.id || 'Unknown User')
    );
  };

  const getAvatarFallback = (user: User | null | undefined): string => {
    const displayName = getDisplayName(user);
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  const getAvatarPath = (avatar: string | null | undefined): string => {
    if (!avatar) return `${BASE_URL}/default-avatar.jpg`;
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  const handleShare = () => {
    let shareUrl: string;
    switch (postType) {
      case 'post':
        shareUrl = `${window.location.origin}/post/${post._id}`;
        break;
      case 'product':
        shareUrl = `${window.location.origin}/products/${post._id}`;
        break;
      case 'event':
        shareUrl = `${window.location.origin}/events/${post._id}`;
        break;
      default:
        shareUrl = `${window.location.origin}/post/${post._id}`;
    }

    if (onShare) {
      onShare();
    }

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast({
          title: 'Link Copied!',
          description: `${postType.charAt(0).toUpperCase() + postType.slice(1)} link copied to clipboard.`,
        });
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy link. Please try again.',
          variant: 'destructive',
        });
      });
  };

  const formatTimeAgo = (date: string | Date): string => {
    try {
      return formatDistance(new Date(date), new Date(), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  const formatEventDate = (date: string | Date): string => {
    try {
      return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const handleDeletePost = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    if (!isOwner) {
      toast({
        title: 'Error',
        description: 'You are not authorized to delete this post.',
        variant: 'destructive',
      });
      return;
    }

    if (onDelete) {
      onDelete(post._id);
    }
  };

  const handleEditPost = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'Not authenticated. Please log in.',
        variant: 'destructive',
      });
      return;
    }

    if (!isOwner) {
      toast({
        title: 'Error',
        description: 'You are not authorized to edit this post.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': API_KEY,
        },
      };

      let response;
      if (postType === 'post') {
        const formData = new FormData();
        formData.append('content', editedContent);
        response = await api.put(`/posts/${post._id}`, formData, {
          ...config,
          headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
        });
      } else if (postType === 'product') {
        const updatedProduct = {
          title: (post as ProductPost).title || '',
          description: editedContent,
          price: (post as ProductPost).price || 0,
          category: (post as ProductPost).category || '',
          condition: (post as ProductPost).condition || '',
          status: (post as ProductPost).status || '',
        };
        response = await api.put(`/products/${post._id}`, updatedProduct, config);
      } else if (postType === 'event') {
        const formData = new FormData();
        formData.append('event_title', (post as EventPost).event_title || '');
        formData.append('event_details', editedContent);
        formData.append('event_date', (post as EventPost).event_date.toString() || '');
        formData.append('event_location', (post as EventPost).event_location || '');
        response = await api.put(`/events/${post._id}`, formData, {
          ...config,
          headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        throw new Error('Invalid post type');
      }

      const updatedData = response.data;
      toast({ title: 'Success', description: `${postType} updated successfully` });
      setDisplayContent(editedContent);
      if (onEdit) {
        const updatedPost: Partial<PostDisplayType> = {
          ...post,
          ...(postType === 'post' && { content: updatedData.data.content }),
          ...(postType === 'product' && { content: updatedData.data.description }),
          ...(postType === 'event' && { content: updatedData.data.event_details }),
        };
        onEdit(post._id, updatedPost);
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to update ${postType}`,
        variant: 'destructive',
      });
    }
  };

  // Handle Mark as Interested with optimistic update
  const handleMarkInterested = async () => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to mark as interested.',
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    const previousIsInterested = isInterested;
    const previousInterestedCount = interestedCount;
    setIsInterested(!isInterested);
    setInterestedCount(isInterested ? interestedCount - 1 : interestedCount + 1);

    // Update search results in query cache
    const searchQueryKey = ['search']; // Adjust based on useSearch queryKey
    queryClient.setQueryData(searchQueryKey, (old: any) => {
      if (!old) return old;
      const updateResults = (results: any) => ({
        users: results.users || [],
        posts: results.posts || [],
        products: results.products || [],
        events: (results.events || []).map((event: any) =>
          event._id === post._id
            ? {
                ...event,
                isInterested: !isInterested,
                interested: isInterested ? event.interested - 1 : event.interested + 1,
              }
            : event
        ),
      });
      return updateResults(old);
    });

    try {
      if (onInterested) {
        await onInterested(); // Call handleInterestedInEvent
        toast({
          title: 'Success',
          description: isInterested ? 'Marked as interested' : 'Removed interest',
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsInterested(previousIsInterested);
      setInterestedCount(previousInterestedCount);
      queryClient.setQueryData(searchQueryKey, (old: any) => {
        if (!old) return old;
        const revertResults = (results: any) => ({
          users: results.users || [],
          posts: results.posts || [],
          products: results.products || [],
          events: (results.events || []).map((event: any) =>
            event._id === post._id
              ? {
                  ...event,
                  isInterested: previousIsInterested,
                  interested: previousInterestedCount,
                }
              : event
          ),
        });
        return revertResults(old);
      });
      toast({
        title: 'Error',
        description: error.message || 'Failed to update interest status.',
        variant: 'destructive',
      });
    }
  };

  const displayUser = fetchedUser || post.user || { _id: 'unknown', username: 'Unknown User' };
  const isOwner =
    currentUser &&
    ((post.user_id && typeof post.user_id === 'string' && currentUser.id === post.user_id) ||
      (post.user_id && typeof post.user_id === 'object' && currentUser.id === post.user_id._id) ||
      (post.user?._id && currentUser.id === post.user._id) ||
      (displayUser._id && currentUser.id === displayUser._id));

  const getImagePath = (image: Image | string | undefined): string | undefined => {
    if (!image) return undefined;
    const path = typeof image === 'string' ? image : image.path;
    return path?.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  const renderUserInfo = () => {
    if (isFetchingUser) {
      return (
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-gray-900">Loading...</span>
              <div className="text-sm text-gray-500">Just a moment</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={getAvatarPath(displayUser.avatar)} alt={getDisplayName(displayUser)} />
            <AvatarFallback>{getAvatarFallback(displayUser)}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              to={`/profile/${displayUser._id || displayUser.id || 'unknown'}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {getDisplayName(displayUser)}
            </Link>
            <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => toast({ title: 'Reported', description: `${postType} reported.` })}
            >
              Report {postType}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveToggle} disabled={isSaving}>
              <Bookmark className="h-4 w-4 mr-2" />
              {isSaved ? `Unsave ${postType}` : `Save ${postType}`}
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit {postType}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeletePost}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete {postType}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderActions = () => (
    <>
      <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
        <div>{post.likes} likes</div>
        <div className="flex gap-3">
          <span>{post.comments.length} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>
      <div className="px-4 py-2 border-t border-b border-gray-100 grid grid-cols-3">
        <BrandedLikeButton onLike={onLike} isLiked={post.liked} initialLikes={post.likes} />
        <Button variant="ghost" onClick={() => setIsCommentModalOpen(true)}>
          <MessageCircle className="h-5 w-5 mr-2" />
          Comment
        </Button>
        <Button variant="ghost" onClick={handleShare}>
          <Share className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>
    </>
  );

  const renderImage = (image: Image | string | undefined, alt: string) => {
    const imagePath = getImagePath(image);
    if (!imagePath) return null;
    return (
      <div className="aspect-video bg-gray-100 cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
        <img src={imagePath} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  };

  if (postType === 'post') {
    return (
      <>
        <Card className="mb-6 overflow-hidden">
          {renderUserInfo()}
          <div className="px-4 pb-3">
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleEditPost}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-line">{displayContent}</p>
            )}
          </div>
          {renderImage(post.image, 'Post attachment')}
          {renderActions()}
        </Card>
        <CustomModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
          <img
            src={getImagePath(post.image)}
            alt="Full-size post attachment"
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </CustomModal>
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          postId={post._id}
          type={postType}
        />
      </>
    );
  }

  if (postType === 'product') {
    const productPost = post as ProductPost;
    return (
      <>
        <Card className="mb-6 overflow-hidden">
          {renderUserInfo()}
          <div className="p-4 flex items-center">
            <Badge variant="outline" className="ml-2 bg-usm-gold text-black">
              <ShoppingBag className="h-3 w-3 mr-1" />
              Product
            </Badge>
          </div>
          {renderImage(productPost.image, productPost.title || 'Product')}
          <div className="p-4">
            {productPost.title && (
              <div className="flex justify-between items-start mb-2">
                <Link to={`/products/${productPost._id}`} className="hover:underline">
                  <h3 className="text-xl font-semibold text-gray-900">{productPost.title}</h3>
                </Link>
                {productPost.price !== undefined && (
                  <div className="text-lg font-bold text-usm-gold flex items-center">
                    <DollarSign className="h-5 w-5" />
                    {productPost.price}
                  </div>
                )}
              </div>
            )}
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleEditPost}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 mb-3">{displayContent}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {productPost.condition && (
                <Badge variant="secondary">
                  <Info className="h-3 w-3 mr-1" />
                  {productPost.condition}
                </Badge>
              )}
              {productPost.category && <Badge variant="outline">{productPost.category}</Badge>}
              {productPost.status && (
                <Badge
                  className={`${
                    productPost.status === 'instock'
                      ? 'bg-green-100 text-green-800'
                      : productPost.status === 'lowstock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {productPost.status === 'instock'
                    ? 'In Stock'
                    : productPost.status === 'lowstock'
                    ? 'Low Stock'
                    : 'Sold Out'}
                </Badge>
              )}
            </div>
            <Button
              className="w-full bg-usm-gold text-black hover:bg-usm-gold-dark mb-3"
              onClick={() => setIsMessageModalOpen(true)}
            >
              Message Seller
            </Button>
          </div>
          {renderActions()}
          <MessageSellerModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            seller={{
              id: displayUser._id || displayUser.id || 'unknown',
              name: getDisplayName(displayUser),
              avatar: displayUser.avatar || '',
            }}
            product={{
              _id: productPost._id,
              title: productPost.title || 'Product',
              price: productPost.price || null,
              image: getImagePath(productPost.image) || null,
              condition: productPost.condition || null,
              category: productPost.category || null,
            }}
          />
        </Card>
        <CustomModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
          <img
            src={getImagePath(productPost.image)}
            alt={productPost.title || 'Full-size product image'}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </CustomModal>
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          postId={post._id}
          type={postType}
        />
      </>
    );
  }

  if (postType === 'event') {
    const eventPost = post as EventPost;
    return (
      <>
        <Card className="mb-6 overflow-hidden">
          {renderUserInfo()}
          <div className="p-4 flex items-center">
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3 mr-1" />
              Event
            </Badge>
          </div>
          {renderImage(eventPost.image, eventPost.event_title)}
          <div className="p-4">
            <Link to={`/events/${eventPost._id}`} className="hover:underline">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{eventPost.event_title}</h3>
            </Link>
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleEditPost}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 mb-3">{displayContent}</p>
            )}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <span>{formatEventDate(eventPost.event_date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                <span>{eventPost.event_location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                <span>{interestedCount} people interested</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button
                className={`${
                  isInterested
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={handleMarkInterested}
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${isInterested ? 'fill-current' : ''}`} />
                {isInterested ? 'Interested' : 'Mark Interested'}
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/events/${eventPost._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Event
                </Link>
              </Button>
            </div>
          </div>
          {renderActions()}
        </Card>
        <CustomModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
          <img
            src={getImagePath(eventPost.image)}
            alt={eventPost.event_title || 'Full-size event image'}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </CustomModal>
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          postId={post._id}
          type={postType}
        />
      </>
    );
  }

  // Fallback for invalid post type
  console.warn('Invalid post type:', postType, 'Post:', post);
  return (
    <Card className="mb-6 p-4">
      Invalid post type: {postType || 'undefined'} for item ID: {post._id}
    </Card>
  );
};

export default PostTypeDisplay;