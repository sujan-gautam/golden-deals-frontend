import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, CalendarDays, Clock, MapPin, Coffee, Pizza, Sandwich, CreditCard, Info, Users, MessageSquare, Share2, Search, Heart, DollarSign, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/HeroSection';
import CategoryCard from '@/components/ui/CategoryCard';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { formatDistance } from 'date-fns';
import MessageSellerModal from '@/components/social/MessageSellerModal'; // Added import

// Custom BrandedLikeButton Component
const BrandedLikeButton = ({ onLike, isLiked: propLiked, initialLikes: propLikes }) => {
  const [likes, setLikes] = useState(propLikes);
  const [liked, setLiked] = useState(propLiked);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  useEffect(() => {
    setLikes(propLikes);
    setLiked(propLiked);
  }, [propLikes, propLiked]);

  const toggleLike = useCallback(() => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes((prev) => (newLikedState ? prev + 1 : prev - 1));
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);
    onLike();
  }, [liked, onLike]);

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full p-0 h-9 w-9 flex items-center justify-center transition-colors ${liked ? 'bg-primary/10 text-primary' : ''} cursor-pointer`}
        onClick={toggleLike}
      >
        <AnimatePresence mode="wait">
          {liked ? (
            <motion.div
              key="filled"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative"
            >
              <motion.svg
                className="h-5 w-5 fill-primary"
                viewBox="0 0 24 24"
                initial={{ rotate: -20 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.8197L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" />
              </motion.svg>
              {showLikeAnimation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-primary"
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{ x: Math.cos(i * Math.PI / 4) * 10, y: Math.sin(i * Math.PI / 4) * 10, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.svg
              key="outline"
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.8197L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </Button>
      <AnimatePresence mode="wait">
        <motion.span
          key={likes}
          className="text-sm font-medium"
          initial={{ scale: 0.8, opacity: 0, y: 5 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -5 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {likes}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// MarketplaceCard Component
interface MarketplaceCardProps {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  category: string;
  stock?: 'instock' | 'lowstock' | 'soldout';
  onPurchaseClick: (id: string) => void;
}

const MarketplaceCard = ({
  id,
  title,
  price,
  description,
  image,
  seller,
  timestamp,
  category,
  stock = 'instock',
  onPurchaseClick,
}: MarketplaceCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const stockText = {
    instock: "In Stock",
    lowstock: "Low Stock",
    soldout: "Sold Out",
  };

  const handlePurchaseClick = () => {
    if (stock === 'soldout') return;
    if (isAuthenticated) {
      navigate(`/products/${id}`);
    } else {
      onPurchaseClick(id);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/products/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge className="capitalize">{category}</Badge>
            <Badge
              variant={stock === 'instock' ? 'secondary' : stock === 'lowstock' ? 'default' : 'destructive'}
            >
              {stockText[stock]}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/products/${id}`} className="block">
            <h3 className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              toast({
                title: isLiked ? "Removed from wishlist" : "Added to wishlist",
                description: isLiked ? `${title} has been removed from your wishlist.` : `${title} has been added to your wishlist.`,
              });
            }}
            className={`p-1 rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex items-center mb-2">
          <DollarSign className="h-4 w-4 text-primary mr-1" />
          <span className="font-bold text-gray-900">${price.toFixed(2)}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{seller.name}</span>
          </div>
          <div className="text-xs text-gray-500">{formatTimeAgo(timestamp)}</div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            disabled={stock === 'soldout'}
            onClick={handlePurchaseClick}
          >
            {isAuthenticated ? (
              <>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message Seller
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4 mr-1" />
                {stock === 'soldout' ? 'Sold Out' : 'Purchase'}
              </>
            )}
          </Button>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMessageModalOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <MessageSellerModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          seller={{ id: seller.id, name: seller.name, avatar: seller.avatar }}
          productName={title}
        />
      )}
    </motion.div>
  );
};

const API_URL = import.meta.env.VITE_API_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

const gradientThemes = [
  'bg-gradient-to-r from-blue-500 to-indigo-600',
  'bg-gradient-to-r from-green-400 to-teal-500',
  'bg-gradient-to-r from-purple-500 to-pink-600',
  'bg-gradient-to-r from-orange-400 to-red-500',
  'bg-gradient-to-r from-yellow-400 to-orange-500',
];

const categoryIcons = [
  <Utensils size={24} />,
  <Sandwich size={24} />,
  <Pizza size={24} />,
  <Coffee size={24} />,
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState('');
  const [popularHomies, setPopularHomies] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRandomGradient = () => gradientThemes[Math.floor(Math.random() * gradientThemes.length)];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { "x-api-key": API_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) } };

      try {
        const [eventsResponse, productsResponse] = await Promise.all([
          api.get('/events/all', config),
          api.get('/products/all', config),
        ]);

        const events = eventsResponse.data || [];
        const products = productsResponse.data.data || [];

        const userIds = [...new Set([
          ...events.map(e => e.user_id?._id).filter(id => id),
          ...products.map(p => p.user_id?._id).filter(id => id),
        ])];

        const userPromises = userIds.map(userId =>
          api.get(`/users/home/${userId}`, config)
            .then(res => res.data)
            .catch(err => {
              console.error(`Failed to fetch user ${userId}:`, err);
              return null;
            })
        );
        const usersRaw = await Promise.all(userPromises);
        const users = usersRaw.filter(user => user);

        const homieScores = users.map(user => {
          const userEvents = events.filter(e => e.user_id?._id === user._id);
          const userProducts = products.filter(p => p.user_id?._id === user._id);

          const totalLikes = 
            userEvents.reduce((sum, event) => sum + (event.likes?.length || 0), 0) +
            userProducts.reduce((sum, product) => sum + (product.likes?.length || 0), 0);
          const totalInterested = userEvents.reduce((sum, event) => sum + (event.interested?.length || 0), 0);
          const totalShares = 
            userEvents.reduce((sum, event) => sum + (event.shares || 0), 0) +
            userProducts.reduce((sum, product) => sum + (product.shares || 0), 0);

          return {
            _id: user._id,
            username: user.username,
            name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username,
            avatar: user.avatar ? `${IMAGE_URL}${user.avatar}` : undefined,
            bio: user.bio || 'No bio available',
            totalLikes,
            totalInterested,
            totalShares,
            bannerGradient: getRandomGradient(),
          };
        });

        const topHomies = homieScores
          .sort((a, b) => b.totalLikes - a.totalLikes)
          .slice(0, 4);
        setPopularHomies(topHomies);

        const sortedEvents = events
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 3)
          .map(event => ({
            _id: event._id,
            title: event.event_title,
            date: event.event_date,
            time: new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: event.event_location,
            details: event.event_details,
            likes: event.likes?.length || 0,
            interested: event.interested?.length || 0,
            shares: event.shares || 0,
            image: event.image?.path ? `${IMAGE_URL}${event.image.path}` : undefined,
            imageGradient: getRandomGradient(),
            category: event.category || 'Event',
          }));
        setUpcomingEvents(sortedEvents);

        const sortedProducts = products
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 3)
          .map(product => ({
            id: product._id,
            title: product.product_name || product.title,
            price: product.product_price || product.price || 0,
            description: product.product_desc || product.description || 'No description available',
            image: product.image?.path ? `${IMAGE_URL}${product.image.path}` : `${IMAGE_URL}/default-product.jpg`,
            seller: {
              id: product.user_id?._id || 'unknown',
              name: product.user_id ? `${product.user_id.firstname || ''} ${product.user_id.lastname || ''}`.trim() || product.user_id.username : 'Unknown Seller',
              avatar: product.user_id?.avatar ? `${IMAGE_URL}${product.user_id.avatar}` : undefined,
            },
            timestamp: product.createdAt || new Date().toISOString(),
            category: product.product_category || product.category || 'Item',
            stock: product.stock || 'instock',
          }));
        setFeaturedProducts(sortedProducts);

        const categoryMap = new Map();
        products.forEach(p => {
          const rawCategory = p.product_category || p.category;
          if (rawCategory) {
            const slug = rawCategory.toLowerCase().replace(/\s+/g, '-');
            if (!categoryMap.has(slug)) {
              categoryMap.set(slug, { title: rawCategory, slug, count: 0 });
            }
            categoryMap.get(slug).count += 1;
          }
        });
        const uniqueCategories = Array.from(categoryMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)
          .map((cat, index) => ({
            title: cat.title,
            icon: categoryIcons[index % categoryIcons.length],
            slug: cat.slug,
            count: cat.count,
          }));
        setPopularCategories(uniqueCategories);

        const uniqueLocations = [...new Set(events.map(e => e.event_location).filter(Boolean))];
        const locations = uniqueLocations.slice(0, 4).map(location => ({
          title: location,
          slug: location.toLowerCase().replace(/\s+/g, '-'),
        }));
        setEventLocations(locations);

        setLastUpdated(Date.now());
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Could not load data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
      setEventLocations(prev => shuffleArray(prev));
    }, 15000);

    return () => clearInterval(interval);
  }, [toast]);

  const handleAuthAction = (action, reason) => {
    if (isAuthenticated) {
      if (action === 'rsvp') {
        toast({
          title: "Success",
          description: "You've successfully RSVP'd to this event!",
        });
      } else {
        navigate(`/${action}`);
      }
    } else {
      setLoginReason(reason);
      setIsAuthModalOpen(true);
    }
  };

  const handlePurchaseClick = (productId: string) => {
    if (!isAuthenticated) {
      setLoginReason('to purchase this item');
      setIsAuthModalOpen(true);
    }
  };

  const handleLike = (type, id) => {
    console.log(`Liked ${type} with ID: ${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection eventLocations={eventLocations} />
        
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Food & Discover Events at USM</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              The ultimate platform for Southern Miss students to order campus food, discover events, and connect with the USM community.
            </p>
            <button 
              onClick={() => handleAuthAction('marketplace', 'to order food')}
              className="mt-6 inline-block bg-usm-gold text-black font-medium px-8 py-3 rounded-full hover:bg-usm-gold-dark transition-colors"
            >
              Order Food
            </button>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Popular Product Categories</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore the hottest product categories on campus
              </p>
              <motion.p
                key={lastUpdated}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-gray-500 mt-2"
              >
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </motion.p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                ))
              ) : (
                popularCategories.map((category) => (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CategoryCard 
                      title={category.title}
                      icon={category.icon}
                      slug={category.slug}
                      count={category.count}
                    />
                  </motion.div>
                ))
              )}
            </div>

            {/* <div className="text-center mb-12">
              <button 
                onClick={() => navigate('/events')}
                className="inline-block bg-usm-gold text-black font-medium px-6 py-3 rounded-full hover:bg-usm-gold-dark transition-colors flex items-center justify-center mx-auto"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </button>
            </div> */}

            <div className="mt-16">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Top Homies</h3>
                <button 
                  onClick={() => handleAuthAction('feed', 'to connect with homies')}
                  className="text-usm-gold hover:text-usm-gold-dark font-medium flex items-center"
                >
                  View All <span className="ml-1">→</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i} className="h-[320px] animate-pulse overflow-hidden">
                      <div className="h-16 bg-gray-200"></div>
                      <div className="p-4 pt-8 space-y-4">
                        <div className="flex justify-center -mt-12">
                          <div className="rounded-full h-20 w-20 bg-gray-200 ring-4 ring-white"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                        <div className="h-8 bg-gray-200 rounded w-full"></div>
                      </div>
                    </Card>
                  ))
                ) : (
                  popularHomies.map((homie) => (
                    <Card key={homie._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none bg-white">
                      <div className={`h-20 ${homie.bannerGradient} rounded-t-lg`}></div>
                      <div className="p-4 pt-0 text-center">
                        <div className="flex justify-center -mt-10">
                          <Avatar className="h-20 w-20 ring-4 ring-white bg-white shadow-md">
                            <AvatarImage src={homie.avatar} alt={homie.name} />
                            <AvatarFallback>{homie.name?.substring(0, 2) || 'U'}</AvatarFallback>
                          </Avatar>
                        </div>
                        <h4 className="font-bold text-gray-900 mt-3 mb-1 text-lg">{homie.name}</h4>
                        <p className="text-gray-500 text-sm mb-2">@{homie.username}</p>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{homie.bio}</p>
                        <div className="flex justify-center items-center gap-6 text-sm text-gray-600 mb-4">
                          <BrandedLikeButton
                            onLike={() => handleLike('homie', homie._id)}
                            isLiked={false}
                            initialLikes={homie.totalLikes}
                          />
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <motion.div whileHover={{ scale: 1.1 }} className="h-4 w-4 text-yellow-500">★</motion.div>
                            {homie.totalInterested}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{homie.totalShares}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAuthAction(`profile/${homie._id}`, 'to view profile')}
                            className="flex items-center justify-center bg-gray-800 text-white py-2 rounded-full hover:bg-gray-900 transition-colors text-sm"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Profile
                          </button>
                          <button 
                            onClick={() => handleAuthAction(`messages`, 'to message this user')}
                            className="flex items-center justify-center bg-usm-gold text-black py-2 rounded-full hover:bg-usm-gold-dark transition-colors text-sm"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Top Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Check out the most popular events on campus
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-96 animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden">
                      {event.image ? (
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full ${event.imageGradient}`}></div>
                      )}
                      <div className="absolute top-2 right-2 bg-usm-gold text-black px-2 py-1 rounded-md text-sm font-medium">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{event.title}</h4>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <button 
                        onClick={() => handleAuthAction(`events/${event._id}`, 'to RSVP for this event')} 
                        className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                      >
                        RSVP Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/events')}
                className="inline-block bg-usm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-usm-gold-dark transition-colors"
              >
                View All Events
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Top Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover the most popular items in the student marketplace
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-[400px] animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : (
                featuredProducts.map((product) => (
                  <MarketplaceCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    description={product.description}
                    image={product.image}
                    seller={product.seller}
                    timestamp={product.timestamp}
                    category={product.category}
                    stock={product.stock}
                    onPurchaseClick={handlePurchaseClick}
                  />
                ))
              )}
            </div>
            
            <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/marketplace')}
                className="inline-block bg-usm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-usm-gold-dark transition-colors"
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Order food or discover events in just a few simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-usm-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Food</h3>
                <p className="text-gray-600">
                  Browse through our range of campus dining options to find your perfect meal.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-usm-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Track in Real-Time</h3>
                <p className="text-gray-600">
                  Know exactly when your food will arrive with our real-time tracking system.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-usm-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-usm-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pay with Eagle Bucks</h3>
                <p className="text-gray-600">
                  Use your student meal plan, Eagle Bucks, or credit card for a seamless payment.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-500 mb-3">
                <Info className="h-4 w-4 inline-block mr-1" />
                Login required for ordering food, RSVPing to events, and accessing the marketplace
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-usm-gold text-black font-medium px-6 py-3 rounded-full hover:bg-usm-gold-dark transition-colors"
              >
                Sign In to Get Started
              </button>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Download the EagleDine App</h2>
                <p className="text-gray-300 mb-8">
                  Get the full Southern Miss dining experience on your mobile device. Order food, discover events, and track your meal plan balance on the go.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button className="flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path 
                        d="M17.5646,3.15186 C16.0946,1.88986 14.1346,1.14286 12.1316,1.14286 C11.2996,1.14286 10.4916,1.26786 9.72464,1.50786 C9.05664,1.71429 8.41964,2.00386 7.82764,2.36786 C5.82164,3.61386 4.43464,5.69786 4.11864,8.10386 C3.91164,9.69386 4.13164,11.3279 4.73864,12.8139 C5.34564,14.3019 6.34164,15.6379 7.60764,16.6079 C8.16064,17.0339 8.76664,17.3699 9.41864,17.6039 C10.0716,17.8379 10.7586,17.9639 11.4586,17.9639 C11.4886,17.9639 11.5176,17.9639 11.5466,17.9639 C12.1946,17.9519 12.8176,17.8279 13.4036,17.5939 C13.9906,17.3579 14.5376,17.0219 15.0386,16.5919 C15.1506,16.4979 15.2606,16.3979 15.3656,16.2939 C15.3696,16.2899 15.3746,16.2859 15.3776,16.2829 C15.7006,15.9619 16.0046,15.6139 16.2266,15.1979 C16.2406,15.1739 16.2516,15.1459 16.2616,15.1159 C16.2616,15.1139 16.2636,15.1139 16.2636,15.1119 C16.2666,15.1039 16.2696,15.0959 16.2716,15.0879 C16.5366,14.4959 16.5896,13.8139 16.4196,13.1619 C16.2466,12.5019 15.8616,11.9019 15.3256,11.4899 C14.9796,11.2179 14.5836,11.0139 14.1546,10.8879 C13.7176,10.7579 13.2556,10.7119 12.7956,10.7439 C12.3236,10.7779 11.8656,10.8939 11.4466,11.0929 C11.0206,11.2939 10.6346,11.5759 10.3166,11.9399 C10.0986,12.1879 9.91664,12.4659 9.77764,12.7639 C9.77664,12.7659 9.77564,12.7679 9.77464,12.7699 C9.53664,13.2739 9.42264,13.8339 9.45364,14.3979 C9.48264,14.9339 9.64464,15.4459 9.92464,15.8939"
                        className="app-download-image w-full h-full"
                      />
                    </svg>
                    <span>App Store</span>
                  </button>
                  <button className="flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path 
                        d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                        className="app-download-image w-full h-full"
                      />
                    </svg>
                    <span>Google Play</span>
                  </button>
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-usm-gold to-black"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">EagleDine - USM's Official Dining App</h3>
                  <p className="text-gray-200">Get it now on iOS and Android</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={loginReason ? `Please sign in ${loginReason}` : undefined}
      />
    </div>
  );
};

export default Index;