import React, { useState, useEffect, Component, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, formatDistance, isValid } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Share,
  ArrowUp,
  Star,
  Clock,
  Ticket,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SocialLayout from "@/components/layout/SocialLayout";
import BrandedLikeButton from "@/components/social/BrandedLikeButton";
import CommentsSection from "@/components/social/CommentsSection";
import { getEventById, markInterestedInEvent, fetchAPI } from "@/services/api";
import { idToString, EventPost } from "@/types/post";
import { Comment } from "@/types/comment";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-gray-600 mt-2">{this.state.error?.message || "An error occurred."}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// API Setup
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";

const SingleEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const userId = user?.id?.toString() || "";
  const [interestedUsers, setInterestedUsers] = useState<any[]>([]);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [isInterested, setIsInterested] = useState(false);

  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
    refetch: refetchEvent,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await getEventById(id as string);
      console.log("Raw API response:", JSON.stringify(response, null, 2));
      return response.data;
    },
    enabled: !!id,
    onSuccess: (data: EventPost) => {
      console.log("Processed event data:", JSON.stringify(data, null, 2));
    },
    onError: (error: any) => {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Map event comments to Comment type with strict user data
  const comments: Comment[] = event?.comments?.map((comment: any) => {
    const commentUserId = comment.user_id?._id || comment.user_id || `unknown-${Date.now()}`;
    const commentUsername = comment.user_id?.username || "Anonymous";
    return {
      _id: comment._id || `comment-${Date.now()}`,
      postId: id as string,
      userId: commentUserId,
      content: comment.content || "",
      likes: Array.isArray(comment.likes)
        ? comment.likes.map((id: any) => id.toString())
        : [],
      parentId: comment.parentId || null,
      mentions: comment.mentions || [],
      createdAt: comment.createdAt || new Date().toISOString(),
      user: {
        _id: commentUserId,
        name: commentUsername,
        avatar: comment.user_id?.avatar
          ? `${IMAGE_URL}${comment.user_id.avatar}`
          : "https://i.pravatar.cc/300",
        username: commentUsername,
      },
      replies: comment.replies || [],
    };
  }) || [];

  useEffect(() => {
    if (event) {
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

      const mappedInterestedUsers = interestedArray.map((interestedId) => {
        if (userId === interestedId && user) {
          return {
            _id: userId,
            username: user.username || "Anonymous",
            avatar: user.avatar ? `${IMAGE_URL}${user.avatar}` : "https://i.pravatar.cc/300",
          };
        }
        if (event.user_id?._id === interestedId) {
          return {
            _id: event.user_id._id,
            username: event.user_id.username || "Anonymous",
            avatar: event.user_id.avatar
              ? `${IMAGE_URL}${event.user_id.avatar}`
              : "https://i.pravatar.cc/300",
          };
        }
        const commentUser = event.comments?.find(
          (c: any) => c.user_id?._id === interestedId
        )?.user_id;
        return {
          _id: interestedId,
          username: commentUser?.username || "Anonymous",
          avatar: commentUser?.avatar
            ? `${IMAGE_URL}${commentUser.avatar}`
            : "https://i.pravatar.cc/300",
        };
      });
      console.log("Mapped interested users:", mappedInterestedUsers);
      setInterestedUsers(mappedInterestedUsers.slice(0, 5));
    }
  }, [event, userId, user]);

  const handleInterestedClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to mark your interest in this event.",
        variant: "destructive",
      });
      return;
    }

    const previousInterested = isInterested;
    const previousCount = interestedCount;

    setIsInterested(!previousInterested);
    setInterestedCount(previousInterested ? previousCount - 1 : previousCount + 1);

    try {
      const response = await markInterestedInEvent(id as string);
      const newInterestedArray = Array.isArray(response.data?.interested)
        ? response.data.interested
            .map((item: any) =>
              typeof item === "object" && item !== null
                ? item._id?.toString() || item.id?.toString()
                : item?.toString()
            )
            .filter(Boolean)
        : [];

      setInterestedCount(newInterestedArray.length);
      setIsInterested(newInterestedArray.includes(userId));

      const mappedInterestedUsers = newInterestedArray.map((interestedId) => {
        if (userId === interestedId && user) {
          return {
            _id: userId,
            username: user.username || "Anonymous",
            avatar: user.avatar ? `${IMAGE_URL}${user.avatar}` : "https://i.pravatar.cc/300",
          };
        }
        if (event?.user_id?._id === interestedId) {
          return {
            _id: event.user_id._id,
            username: event.user_id.username || "Anonymous",
            avatar: event.user_id.avatar
              ? `${IMAGE_URL}${event.user_id.avatar}`
              : "https://i.pravatar.cc/300",
          };
        }
        const commentUser = event?.comments?.find(
          (c: any) => c.user_id?._id === interestedId
        )?.user_id;
        return {
          _id: interestedId,
          username: commentUser?.username || "Anonymous",
          avatar: commentUser?.avatar
            ? `${IMAGE_URL}${commentUser.avatar}`
            : "https://i.pravatar.cc/300",
        };
      });
      setInterestedUsers(mappedInterestedUsers.slice(0, 5));
      toast({
        title: newInterestedArray.includes(userId) ? "Interested!" : "Uninterested",
        description: newInterestedArray.includes(userId)
          ? "You've marked your interest."
          : "You've removed your interest.",
      });
      await refetchEvent();
    } catch (error: any) {
      console.error("Error marking interest:", error);
      setIsInterested(previousInterested);
      setInterestedCount(previousCount);
      toast({
        title: "Error",
        description: error.message || "Failed to update interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like this event.",
        variant: "destructive",
      });
      return;
    }

    const previousLiked = isLiked;
    const previousLikes = likes;

    setIsLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const response = await fetchAPI(`events/${id}/like`, { method: "POST" });
      const newLikesArray = Array.isArray(response.data?.likes)
        ? response.data.likes
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
      await refetchEvent();
    } catch (error: any) {
      console.error("Error liking event:", error);
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      toast({
        title: "Error",
        description: error.message || "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareClick = () => {
    const eventUrl = `${window.location.origin}/events/${id}`;
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

  const formatEventDate = (dateString: string | undefined | null) => {
    if (!dateString) {
      return "Date not specified";
    }
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.warn(`Invalid event_date format: ${dateString}`);
        return "Invalid date";
      }
      return format(date, "EEEE, MMMM d, yyyy • h:mm a");
    } catch (error) {
      console.warn(`Error parsing event_date: ${dateString}`, error);
      return "Invalid date";
    }
  };

  const formatCreatedAt = (dateString: string | undefined | null) => {
    if (!dateString) {
      return "Unknown date";
    }
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        console.warn(`Invalid createdAt format: ${dateString}`);
        return "Unknown date";
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.warn(`Error parsing createdAt: ${dateString}`, error);
      return "Unknown date";
    }
  };

  const timeUntilEvent = event?.event_date
    ? (() => {
        try {
          const eventDate = parseISO(event.event_date);
          if (!isValid(eventDate)) {
            console.warn(`Invalid event_date for timeUntilEvent: ${event.event_date}`);
            return "Unknown time";
          }
          return formatDistance(eventDate, new Date(), { addSuffix: true });
        } catch (error) {
          console.warn(`Error parsing event_date for timeUntilEvent: ${event.event_date}`, error);
          return "Unknown time";
        }
      })()
    : "Unknown time";

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleBackToEvents = () => {
    navigate("/events");
  };

  if (isEventLoading) {
    return (
      <SocialLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (isEventError || !event) {
    return (
      <SocialLayout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleBackToEvents}>Back to Events</Button>
            <Button variant="outline" onClick={() => refetchEvent()}>
              Retry
            </Button>
          </div>
        </div>
      </SocialLayout>
    );
  }

  const isEventIncomplete =
    !event.event_title ||
    !event.event_date ||
    !event.createdAt ||
    !event.user_id?.username;

  const imageUrl = event.image?.path
    ? `${IMAGE_URL}${event.image.path}`
    : "/default-image.jpg";

  return (
    <ErrorBoundary>
      <SocialLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Button
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-900"
            onClick={handleBackToEvents}
          >
            <ArrowUp className="h-4 w-4 mr-2 rotate-270" />
            Back to Events
          </Button>

          {isEventIncomplete && (
            <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              <p>Some event details are missing. Please try again or contact support.</p>
              <div className="flex gap-4 mt-2">
                <Button variant="outline" onClick={() => refetchEvent()}>
                  Retry Loading
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "mailto:support@example.com")}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.event_title || "Untitled Event"}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  {event.category && (
                    <Badge variant="outline" className="text-sm">
                      {event.category}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeUntilEvent}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isInterested
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                  )}
                  onClick={handleInterestedClick}
                >
                  <Star className={cn("h-4 w-4", isInterested ? "fill-current" : "")} />
                  {isInterested ? "Interested" : "I'm Interested"}
                </Button>
                <Button variant="outline" onClick={handleShareClick}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    event.user_id?.avatar ? `${IMAGE_URL}${event.user_id.avatar}` : undefined
                  }
                  alt={event.user_id?.username || "Anonymous"}
                />
                <AvatarFallback>
                  {event.user_id?.username?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <span>
                Organized by{" "}
                <span className="font-medium">
                  {event.user_id?.username || "Anonymous"}
                </span>
              </span>
              <div className="text-sm text-gray-500">
                Posted {formatCreatedAt(event.createdAt)}
              </div>
            </div>
          </div>

          {imageUrl ? (
            <div className="rounded-lg overflow-hidden mb-8 relative">
              <img
                src={imageUrl}
                alt={event.event_title || "Event"}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={(e) => (e.currentTarget.src = "/default-image.jpg")}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{interestedCount} interested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    <span>Free Event</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center rounded-lg mb-8">
              <Calendar className="w-24 h-24 text-white opacity-30" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{event.event_details || "No details available"}</p>
              </div>

              <Separator className="my-8" />

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Interested Attendees ({interestedCount})
                </h3>
                <div className="flex -space-x-2 overflow-hidden">
                  {interestedUsers.map((attendee, index) => (
                    <Avatar
                      key={attendee._id}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    >
                      <AvatarImage
                        src={attendee.avatar}
                        alt={attendee.username || `Attendee ${index + 1}`}
                      />
                      <AvatarFallback>
                        {attendee.username?.[0] || `A${index + 1}`}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {interestedCount > 5 && (
                    <div className="bg-gray-200 text-gray-600 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white">
                      +{interestedCount - 5}
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={toggleComments}
              >
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Comments ({comments.length})
                </span>
                {showComments ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4 rotate-180" />
                )}
              </Button>

              {showComments && (
                <div className="mt-4">
                  <CommentsSection
                    postId={idToString(event._id)}
                    type="event" // Added type prop
                    commentsData={comments}
                    isLoading={false}
                    onCommentAdded={refetchEvent}
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg h-fit">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-start mb-2">
                    <Calendar className="h-5 w-5 mr-3 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Date & Time</h4>
                      <p className="text-gray-700">{formatEventDate(event.event_date)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start mb-2">
                    <MapPin className="h-5 w-5 mr-3 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="text-gray-700">
                        {event.event_location || "Location not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start">
                    <Star className="h-5 w-5 mr-3 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Popularity</h4>
                      <p className="text-gray-700">
                        {interestedCount} people interested
                        <span className="ml-2 text-sm text-gray-500">{likes} likes</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center">
                <div className="cursor-pointer">
                  <BrandedLikeButton
                    isLiked={isLiked}
                    initialLikes={likes}
                    onLike={handleLikeClick}
                    size="sm"
                  />
                </div>
                <div className="text-sm text-gray-500">{event.shares || 0} shares</div>
              </div>
            </div>
          </div>
        </div>
      </SocialLayout>
    </ErrorBoundary>
  );
};

export default SingleEvent;