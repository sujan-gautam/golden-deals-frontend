import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SocialLayout from '@/components/layout/SocialLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';
import { 
  ChevronLeft, 
  MessageSquare, 
  Share, 
  Truck, 
  Info, 
  Star, 
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react';
import MessageSellerModal from '@/components/social/MessageSellerModal';
import { ProductPost } from '@/types/post';
import { usePosts } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import BrandedLikeButton from '@/components/social/BrandedLikeButton';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;
const PROFILE_PICTURE_URL = import.meta.env.VITE_IMAGE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Rating calculation function
const calculateSellerRating = (product: ProductPost) => {
  const {
    likes = [],
    createdAt,
    comments = [],
  } = product;

  const likeCount = Array.isArray(likes) ? likes.length : 0;
  const commentCount = Array.isArray(comments) ? comments.length : 0;
  const totalEngagement = likeCount + commentCount;

  const daysSincePost = Math.min(
    Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    365
  );
  const recencyWeight = 1 - (daysSincePost / 365);

  let baseRating = totalEngagement === 0 ? 3.0 : 3.5;
  const engagementScore = Math.min(totalEngagement / 50, 1);
  baseRating += engagementScore * 1.5;
  baseRating *= (0.9 + (recencyWeight * 0.1));

  const rating = Math.max(1, Math.min(5, Number(baseRating.toFixed(1))));
  const confidence = Math.min(100, totalEngagement * 2);

  return {
    rating,
    confidence,
    totalEngagement,
  };
};

const SingleProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const { posts, isLoading, handleLikePost, handleSharePost } = usePosts(undefined, () =>
    toast({
      title: 'Sign In Required',
      description: 'Please sign in to interact with this product.',
      variant: 'destructive',
    })
  );

  const product = posts.find(post => post._id.toString() === id && post.type === 'product') as ProductPost | undefined;

  useEffect(() => {
    const fetchImage = async () => {
      if (!product?.image?.filename) return;
      try {
        const imageUrl = `${STORAGE_URL}/${product.image.filename}`;
        setImageSrc(imageUrl);
      } catch (error) {
        console.error('Error setting product image URL:', error);
        toast({ title: 'Error', description: 'Failed to load product image.', variant: 'destructive' });
      }
    };
    if (product) fetchImage();
  }, [product, toast]);

  if (isLoading) {
    return (
      <SocialLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (!product) {
    return (
      <SocialLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </SocialLayout>
    );
  }

  const {
    productName = product.title || 'Unnamed Product',
    price = product.price?.toString() || 'N/A',
    content,
    image,
    category,
    condition,
    status = 'instock',
    user,
    createdAt,
    likes,
    location,
  } = product;

  const { rating, confidence, totalEngagement } = calculateSellerRating(product);

  const formatTimeAgo = (timestamp: string) => formatDistance(new Date(timestamp), new Date(), { addSuffix: true }) || 'recently';

  const statusStyles = {
    instock: 'bg-green-100 text-green-800',
    lowstock: 'bg-yellow-100 text-yellow-800',
    soldout: 'bg-red-100 text-red-800',
  };

  const userId = currentUser?.id?.toString() || '';
  const likesArray = Array.isArray(likes) ? likes.map(item => item._id?.toString() || item.id?.toString() || item?.toString()).filter(Boolean) : [];
  const isProductLiked = userId && likesArray.includes(userId);

  // Construct full avatar URL, avoiding duplication
  const avatarUrl = user.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${PROFILE_PICTURE_URL}${user.avatar}`
    : null;

  // Debug logging
  console.log('User avatar:', user.avatar);
  console.log('Constructed avatarUrl:', avatarUrl);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Product link copied to clipboard.' });
    handleSharePost(id);
  };

  const handleLike = () => {
    if (!currentUser) return toast({ title: 'Sign In Required', description: 'Please sign in to like this product.', variant: 'destructive' });
    handleLikePost(id);
  };

  return (
    <SocialLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <nav className="flex items-center text-sm text-gray-600 mb-8">
          <Link to="/marketplace" className="flex items-center hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Marketplace
          </Link>
          {category && <><span className="mx-2">/</span><Link to={`/marketplace?category=${category}`} className="hover:text-primary">{category}</Link></>}
          <span className="mx-2">/</span><span className="text-gray-800 truncate">{productName}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transform transition-all hover:shadow-xl">
              {imageSrc ? (
                <img src={imageSrc} alt={productName} className="w-full h-full object-contain aspect-square" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 aspect-square">
                  <ImageIcon className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{productName}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="capitalize bg-blue-100 text-blue-800 hover:bg-blue-200">{category || 'Uncategorized'}</Badge>
                    {condition && <Badge variant="outline" className="text-gray-700">{condition}</Badge>}
                    <Badge className={`${statusStyles[status]} font-medium`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                  </div>
                </div>
                <BrandedLikeButton onLike={handleLike} isLiked={isProductLiked} initialLikes={likesArray.length} />
              </div>

              <div className="flex items-center mb-6">
                <DollarSign className="h-8 w-8 text-primary mr-2" />
                <span className="text-4xl font-bold text-gray-900">{price}</span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{content}</p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMessageModalOpen(true)}
                >
                  <MessageSquare className="h-5 w-5 mr-2" /> Message Seller
                </Button>
                <Button variant="outline" onClick={handleShare} className="hover:bg-gray-50">
                  <Share className="h-5 w-5 mr-2" /> Share
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={avatarUrl || ''} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link to={`/profile/${user._id}`} className="font-semibold text-gray-800 hover:text-primary transition-colors">
                    {user.name}
                  </Link>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Posted {formatTimeAgo(createdAt)}
                  </div>
                  {location && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <Tabs defaultValue="shipping" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="shipping" className="text-sm">Shipping</TabsTrigger>
                  <TabsTrigger value="returns" className="text-sm">Returns</TabsTrigger>
                  <TabsTrigger value="seller" className="text-sm">Seller Info</TabsTrigger>
                </TabsList>
                <TabsContent value="shipping">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Truck className="h-5 w-5 text-primary mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Free Campus Delivery</h4>
                        <p className="text-sm text-gray-600">Delivered within 1-2 days on campus</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-primary mt-1 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Local Pickup</h4>
                        <p className="text-sm text-gray-600">Coordinate with seller via message</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="returns">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Return Policy</h4>
                      <p className="text-sm text-gray-600">Contact seller for returns. Sales final unless stated otherwise.</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="seller">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Avatar className="h-14 w-14 mr-4">
                        <AvatarImage src={avatarUrl || ''} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/profile/${user._id}`} className="font-semibold text-gray-800 hover:text-primary transition-colors">
                          {user.name}
                        </Link>
                        <div className="flex items-center text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            ({rating} - {confidence}% confidence)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {totalEngagement} interactions · Member since {new Date(createdAt).getFullYear()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Rating auto-calculated from engagement
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setIsMessageModalOpen(true)}>
                      <MessageSquare className="h-5 w-5 mr-2" /> Contact Seller
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <MessageSellerModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        seller={{ id: user._id.toString(), name: user.name, avatar: avatarUrl || '' }}
        product={{
          _id: product._id.toString(),
          title: productName,
          price: parseFloat(price) || undefined,
          image: imageSrc || undefined,
          condition: product.condition || undefined,
          category: product.category || undefined,
        }}
      />
    </SocialLayout>
  );
};

export default SingleProduct;