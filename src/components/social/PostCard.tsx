import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, ThumbsUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentsSection from './CommentsSection';
import { motion } from 'framer-motion';

interface User {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  avatar?: string | null;
}

interface PostCardProps {
  post: {
    id?: string;
    _id?: string;
    user?: User;
    user_id?: User;
    userId?: string;
    content?: string;
    event_title?: string;
    product_name?: string;
    image?: string;
    likes?: number | string[];
    liked?: boolean;
    comments?: number | any[];
    shares?: number;
    createdAt: string;
    type?: 'post' | 'product' | 'event'; // Add type to distinguish events
    interested?: number | string[]; // For events
    isInterested?: boolean; // For events
  };
  onLike: () => void;
  onComment: (content: string) => void;
  onShare: () => void;
  onInterested?: () => void; // Add handler for interested
}

const PostCard = ({ post, onLike, onComment, onShare, onInterested }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);

  // Determine user object from different possible keys
  const user = post.user || post.user_id || { id: post.userId, name: 'Unknown', avatar: null };
  const userId = user.id || user._id || post.userId || 'unknown';
  const userName = user.username || user.name || 'Unknown';
  const avatarSrc = user.avatar ? `${import.meta.env.VITE_IMAGE_URL}${user.avatar}` : undefined;


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const handleCommentSubmitted = (content?: string) => {
    if (content) onComment(content);
  };

  // Determine content to display based on post type
  const content = post.content || post.event_title || post.product_name || '';

  // Normalize likes, comments, and interested for display
  const likesCount = Array.isArray(post.likes) ? post.likes.length : post.likes || 0;
  const commentsCount = Array.isArray(post.comments) ? post.comments.length : post.comments || 0;
  const interestedCount = Array.isArray(post.interested) ? post.interested.length : post.interested || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="transition-all duration-300"
    >
      <Card className="mb-4 overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="ring-2 ring-offset-2 ring-indigo-100 h-10 w-10">
                <AvatarImage src={avatarSrc} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/profile/${userId}`}
                  className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {userName}
                </Link>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(post.createdAt)}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg p-1 shadow-lg">
                <DropdownMenuItem className="rounded-md cursor-pointer">Save Post</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md cursor-pointer">Copy Link</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md cursor-pointer">Hide Post</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-md cursor-pointer text-red-600">Report Post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3">
            <p className="text-gray-800 whitespace-pre-line">{content}</p>
          </div>

          {post.image && (
            <div className="rounded-lg overflow-hidden -mx-4 mb-3">
              <img
                src={post.image}
                alt="Post attachment"
                className="w-full object-cover transition duration-500 hover:scale-105"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Heart className={`h-4 w-4 ${post.liked ? 'text-red-500 fill-red-500' : 'text-gray-500'} mr-1`} />
                {likesCount > 0 && (
                  <span className="font-medium">{likesCount}</span>
                )}
              </span>
              {post.type === 'event' && (
                <span className="flex items-center">
                  <ThumbsUp className={`h-4 w-4 ${post.isInterested ? 'text-green-500 fill-green-500' : 'text-gray-500'} mr-1`} />
                  {interestedCount > 0 && (
                    <span className="font-medium">{interestedCount} people interested</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
              <span>{post.shares || 0} {post.shares === 1 ? 'share' : 'shares'}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t flex justify-between bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${post.liked ? 'text-red-500' : 'text-gray-600'} hover:bg-gray-100 transition-colors`}
            onClick={onLike}
          >
            <Heart className={`mr-2 h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
            {post.liked ? 'Liked' : 'Like'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Comment
          </Button>

          {post.type === 'event' && onInterested ? (
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${post.isInterested ? 'text-green-500' : 'text-gray-600'} hover:bg-gray-100 transition-colors`}
              onClick={onInterested}
            >
              <ThumbsUp className={`mr-2 h-5 w-5 ${post.isInterested ? 'fill-current' : ''}`} />
              {post.isInterested ? 'Interested' : 'Mark Interested'}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={onShare}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          )}
        </CardFooter>

        {post.type !== 'event' && (
          <CardFooter className="px-4 py-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={onShare}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          </CardFooter>
        )}

        {showComments && (
          <div className="px-4 py-3 border-t bg-gray-50">
            <CommentsSection
              postId={post.id || post._id || ''}
              onComment={handleCommentSubmitted}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PostCard;