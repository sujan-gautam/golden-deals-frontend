import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Post, idToString } from "../types/post";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./use-auth";

// Use Vite environment variables
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "mySuperSecretToken";

// Axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

const fetchAllContent = async (userId?: string): Promise<Post[]> => {
  const token = localStorage.getItem("token");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  let postsData: any[] = [];
  let productsData: any[] = [];
  let eventsData: any[] = [];

  const baseUrl = userId ? `/users/${userId}` : "";
  const postsEndpoint = userId ? `${baseUrl}/posts` : "/posts/all";
  const productsEndpoint = userId ? `${baseUrl}/products` : "/products/all";
  const eventsEndpoint = userId ? `${baseUrl}/events` : "/events/all";

  try {
    const postsRes = await api.get(postsEndpoint, config);
    postsData = Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch posts from ${postsEndpoint}:`, error);
  }

  try {
    const productsRes = await api.get(productsEndpoint, config);
    productsData = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch products from ${productsEndpoint}:`, error);
  }

  try {
    const eventsRes = await api.get(eventsEndpoint, config);
    eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data.data || [];
  } catch (error) {
    console.error(`Failed to fetch events from ${eventsEndpoint}:`, error);
  }

  const normalizedPosts = postsData.map((post: any) => ({
    _id: post._id,
    userId: post.user_id?._id || post.user_id || post.user?._id,
    user: {
      _id: post.user_id?._id || post.user_id || post.user?._id,
      name: `${post.user_id?.firstname || post.user?.firstname || ""} ${post.user_id?.lastname || post.user?.lastname || ""}`.trim() || "Unknown",
      avatar: post.user_id?.avatar || post.user?.avatar ? `${IMAGE_URL}${post.user_id?.avatar || post.user?.avatar}` : "",
    },
    content: post.content || "",
    image: post.image
      ? { filename: post.image.filename || "", path: `${IMAGE_URL}${post.image.path || ""}`, mimetype: post.image.mimetype || "" }
      : undefined,
    likes: post.likes || [],
    comments: post.comments || [],
    shares: post.shares || 0,
    createdAt: post.createdAt || new Date().toISOString(),
    type: "post" as const,
  }));

  const normalizedProducts = productsData.map((product: any) => ({
    _id: product._id,
    userId: product.user_id?._id || product.user_id || product.user?._id,
    user: {
      _id: product.user_id?._id || product.user_id || product.user?._id,
      name: product.user_id?.firstname || product.user?.firstname ? `${product.user_id?.firstname || product.user?.firstname} ${product.user_id?.lastname || product.user?.lastname || ""}`.trim() : "Unknown",
      avatar: product.user_id?.avatar || product.user?.avatar ? `${IMAGE_URL}${product.user_id?.avatar || product.user?.avatar}` : "",
    },
    content: product.description || product.product_desc || "",
    title: product.title || product.product_name || "Untitled",
    price: product.price || product.product_price || 0,
    category: product.category || product.product_category || "",
    condition: product.condition || "new",
    status: product.status || "instock",
    image: product.image
      ? { filename: product.image.filename || "", path: `${IMAGE_URL}${product.image.path || ""}`, mimetype: product.image.mimetype || "" }
      : undefined,
    likes: product.likes || [],
    comments: product.comments || [],
    shares: product.shares || 0,
    createdAt: product.createdAt || new Date().toISOString(),
    type: "product" as const,
  }));

  const normalizedEvents = eventsData.map((event: any) => ({
    _id: event._id,
    userId: event.user_id?._id || event.user_id || event.user?._id,
    user: {
      _id: event.user_id?._id || event.user_id || event.user?._id,
      name: `${event.user_id?.firstname || event.user?.firstname || ""} ${event.user_id?.lastname || event.user?.lastname || ""}`.trim() || "Unknown",
      avatar: event.user_id?.avatar || event.user?.avatar ? `${IMAGE_URL}${event.user_id?.avatar || event.user?.avatar}` : "",
    },
    content: event.event_details || "",
    event_title: event.event_title || "Untitled Event",
    event_date: event.event_date || new Date().toISOString(),
    event_location: event.event_location || "Unknown Location",
    image: event.image
      ? { filename: event.image.filename || "", path: `${IMAGE_URL}${event.image.path || ""}`, mimetype: event.image.mimetype || "" }
      : undefined,
    likes: event.likes || [],
    interested: event.interested || [],
    comments: event.comments || [],
    shares: event.shares || 0,
    createdAt: event.createdAt || new Date().toISOString(),
    type: "event" as const,
  }));

  const allContent = [...normalizedPosts, ...normalizedProducts, ...normalizedEvents];
  return Array.from(new Map(allContent.map((post) => [post._id, post])).values());
};

const fetchPublicProducts = async (): Promise<Post[]> => {
  try {
    const response = await api.get("/products/all");
    const productsData = Array.isArray(response.data) ? response.data : response.data.data || [];
    return productsData.map((product: any) => ({
      _id: product._id,
      userId: product.user_id?._id || product.user_id || product.user?._id,
      user: {
        _id: product.user_id?._id || product.user_id || product.user?._id,
        name: product.user_id?.firstname || product.user?.firstname ? `${product.user_id?.firstname || product.user?.firstname} ${product.user_id?.lastname || product.user?.lastname || ""}`.trim() : "Unknown",
        avatar: product.user_id?.avatar || product.user?.avatar ? `${IMAGE_URL}${product.user_id?.avatar || product.user?.avatar}` : "",
      },
      content: product.description || product.product_desc || "",
      title: product.title || product.product_name || "Untitled",
      price: product.price || product.product_price || 0,
      category: product.category || product.product_category || "",
      condition: product.condition || "new",
      status: product.status || "instock",
      image: product.image
        ? { filename: product.image.filename || "", path: `${IMAGE_URL}${product.image.path || ""}`, mimetype: product.image.mimetype || "" }
        : undefined,
      likes: product.likes || [],
      comments: product.comments || [],
      shares: product.shares || 0,
      createdAt: product.createdAt || new Date().toISOString(),
      type: "product" as const,
    }));
  } catch (error) {
    console.error("Failed to fetch public products:", error);
    return [];
  }
};

const createContent = async (postData: Partial<Post>): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  const config = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
  const formData = new FormData();

  switch (postData.type) {
    case "post":
      formData.append("content", postData.content || "");
      if (postData.image instanceof Blob) formData.append("image", postData.image);
      break;
    case "product":
      formData.append("title", postData.title || "");
      formData.append("description", postData.content || "");
      formData.append("price", String(postData.price || 0));
      formData.append("category", postData.category || "");
      formData.append("condition", postData.condition || "new");
      formData.append("status", postData.status || "instock");
      if (postData.image instanceof Blob) formData.append("image", postData.image);
      break;
    case "event":
      formData.append("event_title", postData.event_title || "");
      formData.append("event_details", postData.content || "");
      formData.append("event_date", postData.event_date || new Date().toISOString());
      formData.append("event_location", postData.event_location || "");
      if (postData.image instanceof Blob) formData.append("image", postData.image);
      break;
    default:
      throw new Error("Invalid content type");
  }

  const response = await api.post(`/${postData.type}s`, formData, config);
  return response.data.data;
};

const editContent = async (postId: string, updatedPost: Partial<Post>): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  const config = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
  const formData = new FormData();

  switch (updatedPost.type) {
    case "post":
      formData.append("content", updatedPost.content || "");
      if (updatedPost.image instanceof Blob) formData.append("image", updatedPost.image);
      break;
    case "product":
      formData.append("title", updatedPost.title || "");
      formData.append("description", updatedPost.content || "");
      formData.append("price", String(updatedPost.price || 0));
      formData.append("category", updatedPost.category || "");
      formData.append("condition", updatedPost.condition || "new");
      formData.append("status", updatedPost.status || "instock");
      if (updatedPost.image instanceof Blob) formData.append("image", updatedPost.image);
      break;
    case "event":
      formData.append("event_title", updatedPost.event_title || "");
      formData.append("event_details", updatedPost.content || "");
      formData.append("event_date", updatedPost.event_date || new Date().toISOString());
      formData.append("event_location", updatedPost.event_location || "");
      if (updatedPost.image instanceof Blob) formData.append("image", updatedPost.image);
      break;
    default:
      throw new Error("Invalid content type");
  }

  const response = await api.put(`/${updatedPost.type}s/${postId}`, formData, config);
  return response.data.data;
};

const deleteContent = async (postId: string, type: string): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  await api.delete(`/${type}s/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const likeContent = async (postId: string, type: string): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  const response = await api.post(`/${type}s/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

const commentOnContent = async ({ postId, content, type }: { postId: string; content: string; type: string }): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  const response = await api.post(`/${type}s/${postId}/comment`, { content }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.data;
};

const markInterestedInEvent = async (eventId: string): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  const response = await api.post(`/events/${eventId}/interested`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.data;
};

const shareContent = async (postId: string, type: string): Promise<Post> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("AUTH_REQUIRED");
  const response = await api.post(`/${type}s/${postId}/share`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.data;
};

export const usePosts = (userId?: string, onAuthRequired?: () => void) => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Post[]>({
    queryKey: ["posts", userId],
    queryFn: () => (isAuthenticated ? fetchAllContent(userId) : fetchPublicProducts()),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (err: any) => {
      toast({ title: "Error fetching feed", description: err.message || "Failed to load content.", variant: "destructive" });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: createContent,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      const tempPost: Post = {
        _id: `temp-${Date.now()}`,
        userId: user?.id || "",
        user: {
          _id: user?.id || "",
          name: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || user?.username || "Unknown",
          avatar: user?.avatar ? `${IMAGE_URL}${user.avatar}` : "",
        },
        type: newPost.type || "post", // Explicitly set type here
        content: newPost.type === "post" ? newPost.content || "" : 
                 newPost.type === "product" ? newPost.description || "" : 
                 newPost.event_details || "",
        image: newPost.image ? { path: URL.createObjectURL(newPost.image), filename: newPost.image.name, mimetype: newPost.image.type } : undefined,
        likes: 0,
        liked: false,
        shares: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(newPost.type === "product" && {
          title: newPost.title || "Untitled",
          price: newPost.price || 0,
          category: newPost.category || "",
          condition: newPost.condition || "new",
          status: newPost.status || "instock",
        }),
        ...(newPost.type === "event" && {
          event_title: newPost.event_title || "Untitled Event",
          event_date: newPost.event_date || new Date().toISOString(),
          event_location: newPost.event_location || "Unknown Location",
          interested: 0,
          isInterested: false,
        }),
      };
  
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) => [tempPost, ...old]);
      return { previousPosts };
    },
    onSuccess: (newPost, variables) => {
      // Ensure type is preserved from the input variables if not provided by server
      const postType = variables.type || "post"; // Fallback to "post" if type is missing
      const normalizedNewPost: Post = {
        _id: idToString(newPost._id),
        userId: newPost.user_id?._id || newPost.user_id || newPost.user?._id || user?.id || "",
        user: {
          _id: newPost.user_id?._id || newPost.user_id || newPost.user?._id || user?.id || "",
          name: newPost.user_id?.firstname || newPost.user?.firstname 
            ? `${newPost.user_id?.firstname || newPost.user?.firstname} ${newPost.user_id?.lastname || newPost.user?.lastname || ""}`.trim() 
            : user?.username || "Unknown",
          avatar: newPost.user_id?.avatar || newPost.user?.avatar || user?.avatar 
            ? `${IMAGE_URL}${newPost.user_id?.avatar || newPost.user?.avatar || user?.avatar}` 
            : "",
        },
        type: postType, // Explicitly set type from variables, not server response
        content: newPost.content || newPost.description || newPost.event_details || "",
        image: newPost.image 
          ? { 
              path: newPost.image.path?.startsWith("http") ? newPost.image.path : `${IMAGE_URL}${newPost.image.path || ""}`, 
              filename: newPost.image.filename || "", 
              mimetype: newPost.image.mimetype || "" 
            } 
          : undefined,
        likes: Array.isArray(newPost.likes) ? newPost.likes.length : newPost.likes || 0,
        liked: user?.id ? (Array.isArray(newPost.likes) && newPost.likes.includes(user.id)) : false,
        shares: newPost.shares || 0,
        comments: newPost.comments || [],
        createdAt: newPost.createdAt || new Date().toISOString(),
        updatedAt: newPost.updatedAt || new Date().toISOString(),
        ...(postType === "product" && {
          title: newPost.title || "Untitled",
          price: newPost.price || 0,
          category: newPost.category || "",
          condition: newPost.condition || "new",
          status: newPost.status || "instock",
        }),
        ...(postType === "event" && {
          event_title: newPost.event_title || "Untitled Event",
          event_date: newPost.event_date || new Date().toISOString(),
          event_location: newPost.event_location || "Unknown Location",
          interested: Array.isArray(newPost.interested) ? newPost.interested.length : newPost.interested || 0,
          isInterested: user?.id ? (Array.isArray(newPost.interested) && newPost.interested.includes(user.id)) : false,
        }),
      };
  
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) => [
        normalizedNewPost,
        ...old.filter((p) => !p._id.startsWith("temp-")),
      ]);
      toast({ title: "Content created", description: `${postType} published successfully.` });
      setIsCreatingPost(false);
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error creating content", description: error.response?.data?.message || "Something went wrong.", variant: "destructive" });
      }
      setIsCreatingPost(false);
    },
  });

  const editContentMutation = useMutation({
    mutationFn: ({ postId, updatedPost }: { postId: string; updatedPost: Partial<Post> }) => editContent(postId, updatedPost),
    onMutate: async ({ postId, updatedPost }) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((p) => (idToString(p._id) === postId ? { ...p, ...updatedPost } : p))
      );
      return { previousPosts };
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((p) => (idToString(p._id) === idToString(updatedPost._id) ? updatedPost : p))
      );
      toast({ title: "Content updated", description: `Content updated successfully.` });
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error updating content", description: error.message || "Something went wrong.", variant: "destructive" });
      }
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => deleteContent(postId, type),
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) => old.filter((p) => idToString(p._id) !== postId));
      return { previousPosts };
    },
    onSuccess: () => {
      toast({ title: "Content deleted", description: "Content removed successfully." });
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error deleting content", description: error.message || "Something went wrong.", variant: "destructive" });
      }
    },
  });

  const likeContentMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => likeContent(postId, type),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((post) => {
          if (idToString(post._id) === postId && post.type === type) {
            const likes = Array.isArray(post.likes) ? [...post.likes] : [];
            const userId = user?.id as string;
            const alreadyLiked = likes.includes(userId);
            return {
              ...post,
              likes: alreadyLiked ? likes.filter((id) => id !== userId) : [...likes, userId],
            };
          }
          return post;
        })
      );
      return { previousPosts };
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((post) =>
          idToString(post._id) === idToString(updatedPost._id)
            ? { ...post, likes: updatedPost.likes }
            : post
        )
      );
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to like content.", variant: "destructive" });
      }
    },
  });

  const commentContentMutation = useMutation({
    mutationFn: commentOnContent,
    onMutate: async ({ postId, type, content }) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((post) =>
          idToString(post._id) === postId && post.type === type
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  { _id: `temp-${Date.now()}`, user: user!, content, createdAt: new Date().toISOString() },
                ],
              }
            : post
        )
      );
      return { previousPosts };
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((p) => (idToString(p._id) === idToString(updatedPost._id) ? updatedPost : p))
      );
      toast({ title: "Comment added", description: "Your comment has been added successfully." });
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to add comment.", variant: "destructive" });
      }
    },
  });

  const interestedInEventMutation = useMutation({
    mutationFn: markInterestedInEvent,
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((post) => {
          if (idToString(post._id) === eventId && post.type === "event") {
            const interested = Array.isArray(post.interested) ? [...post.interested] : [];
            const userId = user?.id as string;
            const alreadyInterested = interested.includes(userId);
            return {
              ...post,
              interested: alreadyInterested
                ? interested.filter((id) => id !== userId)
                : [...interested, userId],
            };
          }
          return post;
        })
      );
      return { previousPosts };
    },
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((post) =>
          idToString(post._id) === idToString(updatedEvent._id)
            ? { ...post, interested: updatedEvent.interested }
            : post
        )
      );
      toast({ title: "Success", description: "Your interest has been recorded." });
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to mark interest.", variant: "destructive" });
      }
    },
  });

  const shareContentMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => shareContent(postId, type),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts", userId]) || [];
      queryClient.setQueryData<Post[]>(["posts", userId], (old = []) =>
        old.map((post) => (idToString(post._id) === postId && post.type === type ? { ...post, shares: (post.shares || 0) + 1 } : post))
      );
      return { previousPosts };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Content shared successfully." });
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData<Post[]>(["posts", userId], context?.previousPosts);
      if (error.message === "AUTH_REQUIRED") {
        onAuthRequired?.();
      } else {
        toast({ title: "Error", description: error.response?.data?.message || "Failed to share content.", variant: "destructive" });
      }
    },
  });

  const handleCreatePost = useCallback(
    (postData: Partial<Post>) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      setIsCreatingPost(true);
      createContentMutation.mutate(postData);
    },
    [isAuthenticated, createContentMutation, onAuthRequired]
  );

  const handleEditPost = useCallback(
    (postId: string, updatedPost: Partial<Post>) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      editContentMutation.mutate({ postId, updatedPost });
    },
    [isAuthenticated, editContentMutation, onAuthRequired]
  );

  const handleDeletePost = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      const post = posts.find((p) => idToString(p._id) === postId);
      if (post) {
        deleteContentMutation.mutate({ postId, type: post.type });
      }
    },
    [isAuthenticated, deleteContentMutation, posts, onAuthRequired]
  );

  const handleLikePost = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      const post = posts.find((p) => idToString(p._id) === postId);
      if (post) {
        likeContentMutation.mutate({ postId, type: post.type });
      }
    },
    [isAuthenticated, likeContentMutation, posts, onAuthRequired]
  );

  const handleCommentOnPost = useCallback(
    (postId: string, content: string) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      if (!content.trim()) {
        toast({ title: "Empty comment", description: "Please enter a comment.", variant: "destructive" });
        return;
      }
      const post = posts.find((p) => idToString(p._id) === postId);
      if (post) {
        commentContentMutation.mutate({ postId, content, type: post.type });
      }
    },
    [isAuthenticated, commentContentMutation, posts, onAuthRequired, toast]
  );

  const handleInterestedInEvent = useCallback(
    (eventId: string) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      interestedInEventMutation.mutate(eventId);
    },
    [isAuthenticated, interestedInEventMutation, onAuthRequired]
  );

  const handleSharePost = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        return;
      }
      const post = posts.find((p) => idToString(p._id) === postId);
      if (post) {
        shareContentMutation.mutate({ postId, type: post.type });
      }
    },
    [isAuthenticated, shareContentMutation, posts, onAuthRequired]
  );

  return {
    posts,
    isLoading,
    error,
    refetch,
    isCreatingPost,
    setIsCreatingPost,
    handleCreatePost,
    handleEditPost,
    handleDeletePost,
    handleLikePost,
    handleCommentOnPost,
    handleInterestedInEvent,
    handleSharePost,
  };
};