
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post } from '../types/post';
import { getPosts, createPost, likePost, commentOnPost } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './use-auth';

export const usePosts = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Fetch posts with error handling and fallback to local storage
  const {
    data: posts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        return await getPosts();
      } catch (error) {
        console.error('Error fetching posts:', error);
        // If API fails, try to get from localStorage
        const localPosts = localStorage.getItem('posts');
        if (localPosts) {
          return JSON.parse(localPosts);
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Store posts in localStorage whenever they change
  const storePostsLocally = useCallback((newPosts) => {
    try {
      localStorage.setItem('posts', JSON.stringify(newPosts));
    } catch (err) {
      console.error('Error storing posts locally:', err);
    }
  }, []);

  // If we have posts, store them locally
  if (posts && posts.length > 0) {
    storePostsLocally(posts);
  }

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']) || [];
      
      // Create temporary post with local ID
      const tempPost = {
        ...newPost,
        _id: `temp-${Date.now()}`,
        userId: user?._id || '',
        user: {
          _id: user?._id || '',
          name: user?.name || '',
          avatar: user?.avatar || '',
        },
        likes: [],
        comments: 0,
        createdAt: new Date().toISOString(),
      };
      
      // Optimistically update the cache
      const updatedPosts = [tempPost, ...previousPosts];
      queryClient.setQueryData(['posts'], updatedPosts);
      storePostsLocally(updatedPosts);
      
      return { previousPosts };
    },
    onSuccess: (newPost, _, context) => {
      // Update cache with the actual post from server
      const currentPosts = queryClient.getQueryData(['posts']) || [];
      
      // Replace temp post with actual post
      const updatedPosts = currentPosts.map((post: Post) => 
        post._id?.toString().startsWith('temp-') ? newPost : post
      );
      
      queryClient.setQueryData(['posts'], updatedPosts);
      storePostsLocally(updatedPosts);
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      setIsCreatingPost(false);
    },
    onError: (error: any, _, context) => {
      // Revert to previous posts on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      toast({
        title: "Error creating post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always invalidate to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: likePost,
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['posts'], (old: any) => {
        const updatedPosts = old.map((post: Post) => {
          if (post._id?.toString() === postId) {
            const likes = Array.isArray(post.likes) ? [...post.likes] : [];
            const userId = user?._id as string;
            const alreadyLiked = likes.includes(userId);
            
            return {
              ...post,
              likes: alreadyLiked 
                ? likes.filter(id => id !== userId) 
                : [...likes, userId]
            };
          }
          return post;
        });
        
        storePostsLocally(updatedPosts);
        return updatedPosts;
      });
      
      return { previousPosts };
    },
    onError: (error: any, _postId, context) => {
      // Rollback to the previous value
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with server
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Comment post mutation
  const commentPostMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      commentOnPost(postId, content),
    onMutate: async ({ postId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['posts'], (old: any) => {
        const updatedPosts = old.map((post: Post) => {
          if (post._id?.toString() === postId) {
            return {
              ...post,
              comments: (post.comments || 0) + 1
            };
          }
          return post;
        });
        
        storePostsLocally(updatedPosts);
        return updatedPosts;
      });
      
      return { previousPosts };
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: any, _, context) => {
      // Rollback to the previous value
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Handle like post
  const handleLikePost = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    likePostMutation.mutate(postId);
  };

  // Handle comment on post
  const handleCommentOnPost = (postId: string, content: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to comment on posts",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    
    commentPostMutation.mutate({ postId, content });
  };

  // Handle create post
  const handleCreatePost = (postData: Partial<Post>) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to create posts",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate(postData);
  };

  return {
    posts,
    isLoading,
    error,
    refetch,
    isCreatingPost,
    setIsCreatingPost,
    handleCreatePost,
    handleLikePost,
    handleCommentOnPost,
    createPostLoading: createPostMutation.isPending,
    likePostLoading: likePostMutation.isPending,
    commentPostLoading: commentPostMutation.isPending,
  };
};
