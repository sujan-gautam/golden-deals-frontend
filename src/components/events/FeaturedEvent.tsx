import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Star, Share, Ticket } from "lucide-react";
import BrandedLikeButton from "../social/BrandedLikeButton";
import AuthModal from "@/components/auth/AuthModal";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
const API_KEY = import.meta.env.VITE_API_KEY ;

// Axios instance with x-api-key header
const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

interface FeaturedEventProps {
  event: any;
  onInterested: () => void;
  currentUser?: any;
}

const FeaturedEvent: React.FC<FeaturedEventProps> = ({
  event,
  onInterested,
  currentUser,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const userId = currentUser?._id?.toString() || currentUser?.id?.toString() || "";
  const { toast } = useToast();

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    const likesArray = Array.isArray(event.likes)
      ? event.likes
          .map((item: any) =>
            typeof item === "object" && item !== null
              ? item._id?.toString() || item.id?.toString()
              : item?.toString()
          )
          .filter(Boolean)
      : [];
    const interestedArray = Array.isArray(event.interested)
      ? event.interested
          .map((item: any) =>
            typeof item === "object" && item !== null
              ? item._id?.toString() || item.id?.toString()
              : item?.toString()
          )
          .filter(Boolean)
      : [];

    setLikes(likesArray.length);
    setIsLiked(userId && likesArray.includes(userId));
    setInterestedCount(interestedArray.length);
    setIsInterested(userId && interestedArray.includes(userId));
  }, [event, userId]);

  const formattedDate = event.event_date
    ? format(new Date(event.event_date), "EEEE, MMMM d, yyyy h:mm a")
    : "Date not available";

  const imageUrl = event.image?.path
    ? `${IMAGE_URL}${event.image.path}`
    : "/default-image.jpg";

  const handleInterestedClick = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.post(
        `/events/${event._id}/interested`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data || {};
      const newInterestedArray = Array.isArray(data.interested)
        ? data.interested
            .map((item: any) =>
              typeof item === "object" && item !== null
                ? item._id?.toString() || item.id?.toString()
                : item?.toString()
            )
            .filter(Boolean)
        : [];

      setInterestedCount(newInterestedArray.length);
      setIsInterested(newInterestedArray.includes(userId));
      toast({
        title: newInterestedArray.includes(userId) ? "Interested!" : "Uninterested",
        description: newInterestedArray.includes(userId)
          ? "You've marked your interest."
          : "You've removed your interest.",
      });
      onInterested();
    } catch (error) {
      console.error("Error marking interest:", error);
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error.message.includes("VersionError")
          ? "Server’s busy—try again in a sec!"
          : "Failed to update interest. Server issue.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleLikeClick = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.post(
        `/events/${event._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data || {};
      const newLikesArray = Array.isArray(data.likes)
        ? data.likes
            .map((item: any) =>
              typeof item === "object" && item !== null
                ? item._id?.toString() || item.id?.toString()
                : item?.toString()
            )
            .filter(Boolean)
        : [];

      setLikes(newLikesArray.length);
      setIsLiked(newLikesArray.includes(userId));
      toast({
        title: newLikesArray.includes(userId) ? "Liked!" : "Unliked",
        description: newLikesArray.includes(userId)
          ? "You liked this event."
          : "You unliked this event.",
      });
    } catch (error) {
      console.error("Error liking event:", error);
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error.message.includes("VersionError")
          ? "Server’s busy—try again in a sec!"
          : "Failed to update like. Server issue.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleShareClick = () => {
    const eventUrl = `${window.location.origin}/events/${event._id}`;
    navigator.clipboard
      .writeText(eventUrl)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Event link has been copied to clipboard.",
        });
      })
      .catch((error) => {
        console.error("Error copying link:", error);
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
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full">
          <div className="lg:col-span-2 relative">
            <img
              src={imageUrl}
              alt={event.event_title || "Featured Event"}
              className="w-full h-full max-h-96 object-cover"
              onError={(e) => (e.currentTarget.src = "/default-image.jpg")}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-amber-500 px-3 py-1">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <div className="mb-2">
              <Link to={`/events/${event._id}`} className="hover:underline">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {event.event_title || "Untitled Event"}
                </h2>
              </Link>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {event.event_details || "No details available"}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-red-500" />
                  <span>{event.event_location || "Location not specified"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-purple-600" />
                  <span>{interestedCount} people interested</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Star className="h-5 w-5 mr-3 text-yellow-500" />
                  <span>{likes} likes</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={
                      event.user_id?.avatar
                        ? `${IMAGE_URL}${event.user_id.avatar}`
                        : undefined
                    }
                    alt={event.user_id?.username || "Organizer"}
                  />
                  <AvatarFallback>{event.user_id?.username?.[0] || "??"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">Posted on</p>
                  <p className="text-sm text-gray-500">{event.user_id?.username || "USM Events"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button
                  className={cn(
                    "transition-colors",
                    isInterested
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                  )}
                  onClick={handleInterestedClick}
                >
                  <Star
                    className={cn("mr-2 h-4 w-4", isInterested ? "fill-current" : "")}
                  />
                  {isInterested ? "Interested" : "I'm Interested"}
                </Button>

                <Button variant="outline" asChild>
                  <Link to={`/events/${event._id}`}>
                    <Ticket className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="cursor-pointer">
                  <BrandedLikeButton
                    isLiked={isLiked}
                    initialLikes={likes}
                    onLike={handleLikeClick}
                  />
                </div>

                <Button variant="ghost" size="sm" onClick={handleShareClick}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialTab="signin"
        message="Please sign in to like or mark interest in events."
      />
    </>
  );
};

export default FeaturedEvent;