import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, formatDistance } from "date-fns";
import { ArrowLeft, Calendar, MessageCircle, Share, Heart, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SocialLayout from "@/components/layout/SocialLayout";
import BrandedLikeButton from "@/components/social/BrandedLikeButton";
import CommentsSection from "@/components/social/CommentsSection";
import { BasePost, idToString } from "@/types/post";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";
const ICON_SIZE = "h-4 w-4";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

const getPostById = async (id: string): Promise<BasePost> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  const response = await api.get(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const postData = response.data.data as any;

  const transformedPost: BasePost = { ...postData };
  if (!transformedPost.user && postData.user_id) {
    transformedPost.user = {
      _id: idToString(postData.user_id._id || postData.user_id),
      name: postData.user_id.username || "Unknown User",
      avatar: postData.user_id.avatar || "",
    };
  }

  if (!transformedPost.user || !transformedPost.user._id) {
    throw new Error("Post data is missing valid user information");
  }
  return transformedPost;
};

const getComments = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  const response = await api.get(`/posts/${id}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.comments || [];
};

const SinglePost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const userId = user?._id?.toString() || user?.id?.toString() || "";

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id as string),
    enabled: !!id,
  });

  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id as string),
    enabled: !!id && showComments,
  });

  useEffect(() => {
    if (post) {
      const likesArray = Array.isArray(post.likes)
        ? post.likes
            .map((item) =>
              typeof item === "object" && item !== null
                ? item._id?.toString() || item.id?.toString()
                : item?.toString()
            )
            .filter(Boolean)
        : [];
      setLikes(likesArray.length);
      setIsLiked(userId && likesArray.includes(userId));
      if (post.image && typeof post.image === "object" && post.image.path) {
        setImageSrc(`${IMAGE_URL}${post.image.path}`);
      }
      setEditedContent(post.content);
    }
  }, [post, userId]);

  const handleLikeClick = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to like posts", variant: "destructive" });
      return;
    }

    const previousLiked = isLiked;
    const previousLikes = likes;
    setIsLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await api.post(
        `/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}`, "x-api-key": API_KEY } }
      );
      const newLikesArray = Array.isArray(response.data.data?.likes)
        ? response.data.data.likes
            .map((item) =>
              typeof item === "object" && item !== null
                ? item._id?.toString() || item.id?.toString()
                : item?.toString()
            )
            .filter(Boolean)
        : [];
      setLikes(newLikesArray.length);
      setIsLiked(newLikesArray.includes(userId));
      await refetchPost();
    } catch (error) {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      toast({ title: "Error", description: "Failed to like post", variant: "destructive" });
    }
  };

  const handleShareClick = () => {
    const postUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      toast({ title: "Link Copied" });
    }).catch(() => {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    });
  };

  const handleDeletePost = async () => {
    if (!post || userId !== post.user._id) {
      toast({ title: "Error", description: "You can only delete your own posts", variant: "destructive" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await api.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "x-api-key": API_KEY },
      });
      toast({ title: "Post Deleted" });
      navigate("/feed");
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const handleEditPost = async () => {
    if (!post || userId !== post.user._id) {
      toast({ title: "Error", description: "You can only edit your own posts", variant: "destructive" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Error", description: "Not authenticated. Please log in.", variant: "destructive" });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const formData = new FormData();
      formData.append("content", editedContent);

      const response = await api.put(`/posts/${post._id}`, formData, {
        ...config,
        headers: {
          ...config.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedData = response.data;
      toast({ title: "Success", description: "Post updated successfully" });
      await refetchPost();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const handleReportPost = () => {
    toast({ title: "Reported", description: "Post has been reported" });
  };

  const formatPostDate = (dateString: string) => {
    try {
      return formatDistance(parseISO(dateString), new Date(), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (isPostLoading) {
    return (
      <SocialLayout>
        <div className="max-w-[600px] mx-auto px-4 py-6">
          <div className="animate-pulse space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      </SocialLayout>
    );
  }

  if (isPostError || !post || !post.user) {
    return (
      <SocialLayout>
        <div className="max-w-[600px] mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <h2 className="text-lg font-semibold mb-3">Post Not Found</h2>
            <Button variant="outline" onClick={() => navigate("/feed")}>
              Back to Feed
            </Button>
          </div>
        </div>
      </SocialLayout>
    );
  }

  const isOwner = userId === post.user._id;

  return (
    <SocialLayout>
      <div className="max-w-[600px] mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900 w-full justify-start"
          onClick={() => navigate("/feed")}
        >
          <ArrowLeft className={ICON_SIZE + " mr-2"} />
          Back to Feed
        </Button>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <Link to={`/profile/${post.user._id}`} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user.avatar ? `${IMAGE_URL}${post.user.avatar}` : undefined} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium text-gray-900 hover:underline">{post.user.name}</span>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className={ICON_SIZE} />
                  {formatPostDate(post.createdAt)}
                </div>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className={ICON_SIZE} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeletePost}>
                      Delete Post
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleReportPost}>
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-4 pb-4">
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Post content"
                className="w-full rounded-md mb-3 max-h-[400px] object-cover"
                onError={() => setImageSrc(null)}
              />
            )}
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded text-gray-800"
                  rows={4}
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleEditPost}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 text-base leading-6">{post.content}</p>
            )}
          </div>

          <div className="px-4 pb-3 text-sm text-gray-600 flex justify-between">
            <span>{likes} likes</span>
            <span>{comments.length} comments • {post.shares} shares</span>
          </div>

          <Separator />

          <div className="p-2 flex gap-2">
            <BrandedLikeButton
              isLiked={isLiked}
              initialLikes={likes}
              onLike={handleLikeClick}
              className="flex-1 py-2"
            >
              <Heart className={ICON_SIZE + " mr-2"} />
              Like
            </BrandedLikeButton>
            <Button
              variant="outline"
              className="flex-1 py-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className={ICON_SIZE + " mr-2"} />
              Comment
            </Button>
            <Button variant="outline" className="flex-1 py-2" onClick={handleShareClick}>
              <Share className={ICON_SIZE + " mr-2"} />
              Share
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-3 bg-white rounded-lg border border-gray-100 p-4">
            <CommentsSection
              postId={idToString(post._id)}
              commentsData={comments}
              isLoading={isCommentsLoading}
              onCommentAdded={refetchComments}
            />
          </div>
        )}
      </div>
    </SocialLayout>
  );
};

export default SinglePost;