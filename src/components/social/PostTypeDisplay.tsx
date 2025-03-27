
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Share, MoreVertical, MessageCircle, Heart, Calendar, MapPin, ShoppingBag, DollarSign, Info } from 'lucide-react';
import BrandedLikeButton from './BrandedLikeButton';
import CommentsSection from './CommentsSection';
import MessageSellerModal from './MessageSellerModal';
import { formatDistance } from 'date-fns';
import { Post, ProductPost as ProductPostType, EventPost as EventPostType } from '@/types/post';
import { User } from '@/types/user';

interface PostWithLiked extends Omit<Post, 'likes'> {
  likes: number;
  liked: boolean;
}

interface ProductPost extends Omit<ProductPostType, 'likes'> {
  likes: number;
  liked: boolean;
}

interface EventPost extends Omit<EventPostType, 'likes'> {
  likes: number;
  liked: boolean;
}

type PostDisplayType = PostWithLiked | ProductPost | EventPost;

interface PostTypeDisplayProps {
  post: PostDisplayType;
  onLike: () => void;
  onComment: (content?: string) => void;
  currentUser?: User;
}

const PostTypeDisplay: React.FC<PostTypeDisplayProps> = ({ post, onLike, onComment, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post._id)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Post link has been copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the link, please try again.",
          variant: "destructive",
        });
      });
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  
  // Generic post view
  if (post.type === 'post') {
    return (
      <Card className="mb-6 overflow-hidden">
        {/* Post Header with User Info */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/profile/${post.user._id}`} className="font-medium text-gray-900 hover:underline">
                {post.user.name}
              </Link>
              <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report post</DropdownMenuItem>
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Hide posts from this user</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
        </div>
        
        {/* Post Image (if any) */}
        {post.image && (
          <div className="aspect-video bg-gray-100">
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Like & Comment Counts */}
        <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
          <div>{post.likes} likes</div>
          <div>{post.comments} comments</div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-4 py-2 border-t border-b border-gray-100 grid grid-cols-3">
          <BrandedLikeButton 
            onLike={onLike} 
            isLiked={post.liked} 
          />
          <Button
            variant="ghost"
            className="flex items-center justify-center"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-center"
            onClick={handleShare}
          >
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
        
        {/* Comments Section (expandable) */}
        {showComments && (
          <div className="px-4 pb-4">
            <CommentsSection 
              postId={post._id?.toString() || ''}
              initialComments={[
                // We'll start with an empty comments section that users can fill
              ]}
              onComment={onComment}
            />
          </div>
        )}
      </Card>
    );
  }
  
  // Product listing view
  if (post.type === 'product') {
    const productPost = post as ProductPost;
    return (
      <Card className="mb-6 overflow-hidden">
        {/* Product Header with User Info and Product Badge */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <Link to={`/profile/${post.user._id}`} className="font-medium text-gray-900 hover:underline">
                  {post.user.name}
                </Link>
                <Badge variant="outline" className="ml-2 bg-usm-gold text-black">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Product
                </Badge>
              </div>
              <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report listing</DropdownMenuItem>
              <DropdownMenuItem>Save to wishlist</DropdownMenuItem>
              <DropdownMenuItem>Hide posts from this seller</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Product Image */}
        {post.image && (
          <div className="aspect-video bg-gray-100">
            <img
              src={post.image}
              alt={productPost.productName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Product Details */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{productPost.productName}</h3>
            <div className="text-lg font-bold text-usm-gold flex items-center">
              <DollarSign className="h-5 w-5" />
              {productPost.price}
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{post.content}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {productPost.condition && (
              <Badge variant="secondary" className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {productPost.condition}
              </Badge>
            )}
            {productPost.category && (
              <Badge variant="outline" className="flex items-center">
                {productPost.category}
              </Badge>
            )}
            <Badge className={`flex items-center ${
              productPost.status === 'instock' ? 'bg-green-100 text-green-800' : 
              productPost.status === 'lowstock' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {productPost.status === 'instock' ? 'In Stock' : 
               productPost.status === 'lowstock' ? 'Low Stock' : 
               'Sold Out'}
            </Badge>
          </div>
          
          <Button 
            className="w-full bg-usm-gold text-black hover:bg-usm-gold-dark mb-3"
            onClick={() => setIsMessageModalOpen(true)}
          >
            Message Seller
          </Button>
        </div>
        
        {/* Like & Comment Counts */}
        <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
          <div>{post.likes} likes</div>
          <div>{post.comments} comments</div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-4 py-2 border-t border-b border-gray-100 grid grid-cols-3">
          <BrandedLikeButton 
            onLike={onLike} 
            isLiked={post.liked} 
          />
          <Button
            variant="ghost"
            className="flex items-center justify-center"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-center"
            onClick={handleShare}
          >
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
        
        {/* Comments Section (expandable) */}
        {showComments && (
          <div className="px-4 pb-4">
            <CommentsSection 
              postId={post._id?.toString() || ''}
              initialComments={[
                // We'll start with an empty comments section that users can fill
              ]}
              onComment={onComment}
            />
          </div>
        )}
        
        {/* Message Seller Modal */}
        <MessageSellerModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          seller={{
            id: post.user._id,
            name: post.user.name,
            avatar: post.user.avatar
          }}
          productName={productPost.productName}
        />
      </Card>
    );
  }
  
  // Event view
  if (post.type === 'event') {
    const eventPost = post as EventPost;
    return (
      <Card className="mb-6 overflow-hidden">
        {/* Event Header with User Info and Event Badge */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <Link to={`/profile/${post.user._id}`} className="font-medium text-gray-900 hover:underline">
                  {post.user.name}
                </Link>
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                  <Calendar className="h-3 w-3 mr-1" />
                  Event
                </Badge>
              </div>
              <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report event</DropdownMenuItem>
              <DropdownMenuItem>Add to calendar</DropdownMenuItem>
              <DropdownMenuItem>Hide events from this user</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Event Image */}
        {post.image && (
          <div className="aspect-video bg-gray-100">
            <img
              src={post.image}
              alt={eventPost.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Event Details */}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{eventPost.title}</h3>
          <p className="text-gray-700 mb-3">{post.content}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <span>{eventPost.date}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-red-500" />
              <span>{eventPost.location}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Interested
            </Button>
            <Button variant="outline">
              Share Event
            </Button>
          </div>
        </div>
        
        {/* Like & Comment Counts */}
        <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
          <div>{post.likes} likes</div>
          <div>{post.comments} comments</div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-4 py-2 border-t border-b border-gray-100 grid grid-cols-3">
          <BrandedLikeButton 
            onLike={onLike} 
            isLiked={post.liked} 
          />
          <Button
            variant="ghost"
            className="flex items-center justify-center"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-center"
            onClick={handleShare}
          >
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
        
        {/* Comments Section (expandable) */}
        {showComments && (
          <div className="px-4 pb-4">
            <CommentsSection 
              postId={post._id?.toString() || ''}
              initialComments={[
                // We'll start with an empty comments section that users can fill
              ]}
              onComment={onComment}
            />
          </div>
        )}
      </Card>
    );
  }
  
  return null;
};

export default PostTypeDisplay;
