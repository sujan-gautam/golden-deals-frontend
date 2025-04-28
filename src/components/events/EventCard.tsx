import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistance, format } from 'date-fns';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, Star, Share, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandedLikeButton from '../social/BrandedLikeButton';
import AuthModal from '@/components/auth/AuthModal';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";

// Axios instance with default headers including x-api-key
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

interface EventCardProps {
  event: any;
  onInterested: () => void;
  currentUser?: any;
  variant?: 'default' | 'compact';
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onInterested,
  currentUser,
  variant = 'default'
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const userId = currentUser?._id?.toString() || currentUser?.id?.toString() || '';
  const { toast } = useToast();

  const likesArray = Array.isArray(event.likes) ? event.likes.map((item: any) => 
    typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
  ).filter(Boolean) : [];
  const interestedArray = Array.isArray(event.interested) ? event.interested.map((item: any) => 
    typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
  ).filter(Boolean) : [];
  const [likes, setLikes] = useState(likesArray.length);
  const [isLiked, setIsLiked] = useState(userId && likesArray.includes(userId));
  const [interestedCount, setInterestedCount] = useState(interestedArray.length);
  const [isInterested, setIsInterested] = useState(userId && interestedArray.includes(userId));

  useEffect(() => {
    const newLikesArray = Array.isArray(event.likes) ? event.likes.map((item: any) => 
      typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
    ).filter(Boolean) : [];
    const newInterestedArray = Array.isArray(event.interested) ? event.interested.map((item: any) => 
      typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
    ).filter(Boolean) : [];

    setLikes(newLikesArray.length);
    setIsLiked(userId && newLikesArray.includes(userId));
    setInterestedCount(newInterestedArray.length);
    setIsInterested(userId && newInterestedArray.includes(userId));
  }, [event, userId]);

  const eventDate = new Date(event.event_date);
  const timeUntilEvent = formatDistance(eventDate, new Date(), { addSuffix: true });
  const formattedDate = format(eventDate, 'MMM d, yyyy h:mm a');
  const isPastEvent = eventDate < new Date();

  const imageUrl = event.image?.path 
    ? `${IMAGE_URL}${event.image.path}` 
    : '/default-image.jpg';

  const handleInterestedClick = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const response = await api.post(`/events/${event._id}/interested`, {}, config);
      const responseData = response.data;
      const newInterestedArray = Array.isArray(responseData.data?.interested) ? responseData.data.interested.map((item: any) => 
        typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
      ).filter(Boolean) : [];

      setInterestedCount(newInterestedArray.length);
      setIsInterested(newInterestedArray.includes(userId));
      toast({ 
        title: newInterestedArray.includes(userId) ? "Interested!" : "Uninterested", 
        description: newInterestedArray.includes(userId) ? "You've marked your interest." : "You've removed your interest." 
      });
      onInterested();
    } catch (error) {
      console.error('Error marking interest:', error);
      toast({ 
        title: "Error", 
        description: axios.isAxiosError(error) && error.response?.data?.message 
          ? error.response.data.message 
          : "Failed to update interest. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleLikeClick = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const response = await api.post(`/events/${event._id}/like`, {}, config);
      const responseData = response.data;
      const newLikesArray = Array.isArray(responseData.data?.likes) ? responseData.data.likes.map((item: any) => 
        typeof item === 'object' && item !== null ? item._id?.toString() || item.id?.toString() : item?.toString()
      ).filter(Boolean) : [];

      setLikes(newLikesArray.length);
      setIsLiked(newLikesArray.includes(userId));
      toast({ 
        title: newLikesArray.includes(userId) ? "Liked!" : "Unliked", 
        description: newLikesArray.includes(userId) ? "You liked this event." : "You unliked this event." 
      });
    } catch (error) {
      console.error('Error liking event:', error);
      toast({ 
        title: "Error", 
        description: axios.isAxiosError(error) && error.response?.data?.message 
          ? error.response.data.message 
          : "Failed to update like. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleShareClick = () => {
    const eventUrl = `${window.location.origin}/events/${event._id}`;
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Event link has been copied to clipboard.",
        });
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className={cn(
          "overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg transition-shadow",
          isPastEvent && "opacity-75"
        )}>
          {imageUrl && (
            <div className="aspect-video bg-gray-100 relative">
              <img 
                src={imageUrl} 
                alt={event.event_title || 'Event'} 
                className="w-full h-full object-cover" 
                onError={(e) => (e.currentTarget.src = '/default-image.jpg')} 
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge className={isPastEvent ? "bg-gray-500" : "bg-blue-500 text-white"}>
                  {isPastEvent ? "Past Event" : "Upcoming"}
                </Badge>
                {event.category && (
                  <Badge variant="outline" className="bg-white text-gray-800">
                    {event.category}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <CardContent className="flex-1 p-4">
            <Link to={`/events/${event._id}`}>
              <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                {event.event_title || 'Untitled Event'}
              </h3>
            </Link>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm">{formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm">{timeUntilEvent}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">{event.event_location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-sm">{interestedCount} interested</span>
              </div>
            </div>
            
            {variant === 'default' && (
              <p className="text-gray-700 text-sm line-clamp-2">
                {event.event_details || 'No details available'}
              </p>
            )}
            
            <div className="mt-4 flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage 
                  src={event.user_id?.avatar ? `${IMAGE_URL}${event.user_id.avatar}` : undefined} 
                  alt={event.user_id?.username || 'Organizer'} 
                />
                <AvatarFallback>{event.user_id?.username?.[0] || '??'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                Posted on {event.user_id?.username || 'USM Events'}
              </span>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 border-t mt-auto bg-gray-50">
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <Button 
                variant={isInterested ? "default" : "outline"} 
                className={cn(
                  "flex items-center justify-center w-full transition-colors text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2",
                  isInterested ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={handleInterestedClick}
                disabled={isPastEvent}
              >
                <Star className={cn(
                  "h-4 w-4 mr-1 sm:mr-2",
                  isInterested ? "fill-current" : ""
                )} />
                <span className="truncate">{isInterested ? "Interested" : "Interest"}</span>
              </Button>
              
              <div className="flex items-center justify-center cursor-pointer">
                <BrandedLikeButton 
                  isLiked={isLiked}
                  initialLikes={likes}
                  onLike={handleLikeClick}
                  size="sm" // Ensure BrandedLikeButton supports smaller size
                />
              </div>
              
              <Button 
                variant="outline" 
                className={cn(
                  "flex items-center justify-center w-full text-gray-700 hover:bg-gray-100 transition-colors text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2"
                )}
                asChild
              >
                <Link to={`/events/${event._id}`}>
                  <Ticket className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="truncate">View</span>
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialTab="signin"
        message="Please sign in to like or mark interest in events."
      />
    </>
  );
};

export default EventCard;