
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    createdAt: string;
  };
  onLike: () => void;
}

const PostCard = ({ post, onLike }: PostCardProps) => {
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
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/profile/${post.user.id}`} className="font-medium text-gray-900 hover:underline">
                {post.user.name}
              </Link>
              <div className="text-sm text-gray-500">{formatTime(post.createdAt)}</div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save Post</DropdownMenuItem>
              <DropdownMenuItem>Copy Link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Report Post</DropdownMenuItem>
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
              className="w-full object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
          <div className="flex items-center">
            <span className="flex items-center">
              <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
              {post.likes}
            </span>
          </div>
          <div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline"
            >
              {post.comments} comments
            </button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 ${post.liked ? 'text-red-500' : 'text-gray-600'}`}
          onClick={onLike}
        >
          <Heart className={`mr-2 h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
          Like
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-gray-600"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
          <Share2 className="mr-2 h-5 w-5" />
          Share
        </Button>
      </CardFooter>
      
      {showComments && (
        <div className="px-4 py-3 border-t">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={JSON.parse(localStorage.getItem('user') || '{}').avatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full py-2 px-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-usm-gold"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
