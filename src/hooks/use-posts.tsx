
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post } from '../types/post';
import { getPosts, createPost, likePost, commentOnPost } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './use-auth';

export const usePosts = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Fetch posts
  const {
    data: posts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      setIsCreatingPost(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating post",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    },
  });

  // Comment post mutation
  const commentPostMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      commentOnPost(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
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
