
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  MessageCircle,
  Share2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import BrandedLikeButton from './BrandedLikeButton';
import { formatDistance } from 'date-fns';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface BasePost {
  id: string;
  user: User;
  content: string;
  likes: number;
  liked: boolean;
  comments: number;
  createdAt: string;
  image?: string;
  type: string;
}

interface ProductPost extends BasePost {
  type: 'product';
  productName: string;
  price: string;
  category?: string;
  condition?: string;
  status: 'instock' | 'lowstock' | 'soldout';
}

interface EventPost extends BasePost {
  type: 'event';
  title: string;
  date: string;
  location: string;
}

type Post = BasePost | ProductPost | EventPost;

interface PostTypeDisplayProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
}

const PostTypeDisplay: React.FC<PostTypeDisplayProps> = ({ post, onLike, onComment }) => {
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  // Shared post header
  const PostHeader = () => (
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
          <div className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</div>
        </div>
      </div>
    </div>
  );

  // Shared post footer
  const PostFooter = () => (
    <CardFooter className="px-4 py-3 border-t flex justify-between">
      <BrandedLikeButton 
        initialLikes={post.likes} 
        isLiked={post.liked} 
        onLike={onLike} 
      />
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 text-gray-600"
        onClick={onComment}
      >
        <MessageCircle className="mr-2 h-5 w-5" />
        Comment
      </Button>
      <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
        <Share2 className="mr-2 h-5 w-5" />
        Share
      </Button>
    </CardFooter>
  );

  // Regular post display
  if (post.type === 'post' || !post.type) {
    return (
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-4">
          <PostHeader />
          
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
              <span>{post.likes} likes • {post.comments} comments</span>
            </div>
          </div>
        </CardContent>
        
        <PostFooter />
      </Card>
    );
  }

  // Product post display
  if (post.type === 'product') {
    const productPost = post as ProductPost;
    const statusColor = {
      instock: 'bg-green-100 text-green-800',
      lowstock: 'bg-yellow-100 text-yellow-800',
      soldout: 'bg-red-100 text-red-800'
    };
    
    return (
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-4">
          <PostHeader />
          
          <div className="mb-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{productPost.productName}</h3>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-bold text-green-600">{productPost.price}</span>
              </div>
            </div>
            
            <div className="flex items-center mt-1 mb-2">
              <Badge 
                variant={
                  productPost.status === 'instock' ? 'secondary' :
                  productPost.status === 'lowstock' ? 'default' : 'destructive'
                }
                className="mr-2"
              >
                {productPost.status === 'instock' ? 'In Stock' : 
                 productPost.status === 'lowstock' ? 'Low Stock' : 'Sold Out'}
              </Badge>
              
              {productPost.condition && (
                <span className="text-xs text-gray-500 mr-2">
                  Condition: {productPost.condition}
                </span>
              )}
              
              {productPost.category && (
                <span className="text-xs text-gray-500">
                  Category: {productPost.category}
                </span>
              )}
            </div>
            
            <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
          </div>
          
          {post.image && (
            <div className="rounded-lg overflow-hidden mb-3">
              <img
                src={post.image}
                alt="Product"
                className="w-full object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
          
          <div className="mt-4">
            <Button variant="default" size="sm" className="mr-2">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {productPost.status !== 'soldout' ? 'Purchase' : 'Join Waitlist'}
            </Button>
            <Button variant="outline" size="sm">
              Message Seller
            </Button>
          </div>
        </CardContent>
        
        <PostFooter />
      </Card>
    );
  }

  // Event post display
  if (post.type === 'event') {
    const eventPost = post as EventPost;
    
    return (
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-4">
          <PostHeader />
          
          <div className="mb-3">
            <h3 className="text-lg font-semibold">{eventPost.title}</h3>
            
            <div className="flex flex-col space-y-2 mt-2 mb-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(eventPost.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{new Date(eventPost.date).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{eventPost.location}</span>
              </div>
            </div>
            
            <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
          </div>
          
          {post.image && (
            <div className="rounded-lg overflow-hidden mb-3">
              <img
                src={post.image}
                alt="Event"
                className="w-full object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
          
          <div className="mt-4">
            <Button variant="default" size="sm" className="mr-2">
              <Calendar className="h-4 w-4 mr-2" />
              Attend Event
            </Button>
            <Button variant="outline" size="sm">
              Save Event
            </Button>
          </div>
        </CardContent>
        
        <PostFooter />
      </Card>
    );
  }

  return null;
};

export default PostTypeDisplay;
