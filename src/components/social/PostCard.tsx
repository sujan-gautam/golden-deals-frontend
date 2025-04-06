
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentsSection from './CommentsSection';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    image?: string;
    likes: number;
    liked: boolean;
    comments: number;
    shares: number;
    createdAt: string;
  };
  onLike: () => void;
  onComment: (content: string) => void;
  onShare: () => void;
}

const PostCard = ({ post, onLike, onComment, onShare }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    return date.toLocaleDateString();
  };
  
  const handleCommentSubmitted = (content?: string) => {
    if (content) {
      onComment(content);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mb-4 overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="ring-2 ring-offset-2 ring-indigo-100">
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Link 
                  to={`/profile/${post.user.id}`} 
                  className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {post.user.name}
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
            <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
          </div>
          
          {post.image && (
            <div className="rounded-lg overflow-hidden -mx-4 mb-3">
              <img
                src={post.image}
                alt="Post attachment"
                className="w-full object-cover transition duration-300 hover:scale-105"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
            <div className="flex items-center">
              <span className="flex items-center">
                <Heart className={`h-4 w-4 ${post.liked ? 'text-red-500 fill-red-500' : 'text-gray-500'} mr-1`} />
                {post.likes > 0 && (
                  <span className="font-medium">{post.likes}</span>
                )}
              </span>
            </div>
            <div className="flex space-x-3">
              <span>{post.comments} comments</span>
              <span>{post.shares} shares</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 border-t flex justify-between bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 ${post.liked ? 'text-red-500' : 'text-gray-600'} hover:bg-gray-100`}
            onClick={onLike}
          >
            <Heart className={`mr-2 h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Comment
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-gray-600 hover:bg-gray-100"
            onClick={onShare}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </CardFooter>
        
        {showComments && (
          <div className="px-4 py-3 border-t bg-gray-50">
            <CommentsSection 
              postId={post.id}
              onComment={handleCommentSubmitted}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default PostCard;
