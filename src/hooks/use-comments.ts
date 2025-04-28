// src/hooks/use-comments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentOnPost, commentOnProduct, commentOnEvent, likeCommentOnPost, likeCommentOnProduct, likeCommentOnEvent, getComments } from '../services/comment-api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './use-auth';
import { useNavigate } from 'react-router-dom';
import { Comment } from '../types/comment';
import { Button } from '@/components/ui/button';

interface UseCommentsProps {
  postId: string;
  type: 'post' | 'product' | 'event';
  onAuthRequired?: () => void;
}

export const useComments = ({ postId, type, onAuthRequired }: UseCommentsProps) => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Comment[], Error>({
    queryKey: ['comments', postId, type],
    queryFn: () => getComments(postId, type),
    staleTime: 0, // Force fresh fetch
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (err: Error) => {
      if (err.message.includes('not found')) {
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Not Found`,
          description: `The ${type} you are trying to view does not exist or is not accessible.`,
          variant: 'destructive',
        });
        navigate(`/${type}s`, { replace: true });
      } else {
        toast({
          title: 'Error fetching comments',
          description: err.message || 'Failed to load comments.',
          variant: 'destructive',
        });
      }
    },
  });

  const commentMutation = useMutation<Comment, Error, { content: string; parentId?: string; mentions?: string[] }>({
    mutationFn: ({ content, parentId, mentions }) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        throw new Error('Authentication required');
      }
      if (type === 'post') {
        return commentOnPost(postId, content, parentId, mentions);
      } else if (type === 'product') {
        return commentOnProduct(postId, content, parentId, mentions);
      } else {
        return commentOnEvent(postId, content, parentId, mentions);
      }
    },
    onMutate: async ({ content, parentId, mentions }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId, type] });
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', postId, type]) || [];
      const tempComment: Comment = {
        _id: `temp-${Date.now()}`,
        postId,
        userId: user?._id || '',
        content,
        likes: [],
        parentId: parentId || null,
        mentions: mentions || [],
        createdAt: new Date().toISOString(),
        user: {
          _id: user?._id || '',
          name: `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.username || 'Unknown',
          avatar: user?.avatar || 'https://i.pravatar.cc/300',
          username: user?.username || 'anonymous',
        },
        replies: [],
      };
      queryClient.setQueryData<Comment[]>(['comments', postId, type], (old = []) => [...old, tempComment]);
      return { previousComments };
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData<Comment[]>(['comments', postId, type], (old = []) =>
        old.filter((c) => !c._id.startsWith('temp-')).concat(newComment)
      );
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added.',
      });
    },
    onError: (err, _, context) => {
      queryClient.setQueryData<Comment[]>(['comments', postId, type], context?.previousComments);
      toast({
        title: 'Error posting comment',
        description: err.message || 'Failed to post comment.',
        variant: 'destructive',
      });
    },
  });

  const likeCommentMutation = useMutation<Comment, Error, string>({
    mutationFn: (commentId) => {
      if (!isAuthenticated) {
        onAuthRequired?.();
        throw new Error('Authentication required');
      }
      console.log('Liking comment:', { postId, commentId, userId: user?._id });
      if (type === 'post') {
        return likeCommentOnPost(postId, commentId);
      } else if (type === 'product') {
        return likeCommentOnProduct(postId, commentId);
      } else {
        return likeCommentOnEvent(postId, commentId);
      }
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId, type] });
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', postId, type]) || [];
      const userId = user?._id || '';
      console.log('Optimistic update:', { commentId, userId });
      queryClient.setQueryData<Comment[]>(['comments', postId, type], (old = []) =>
        old.map((comment) => {
          if (comment._id === commentId) {
            const likes = Array.isArray(comment.likes) ? [...comment.likes] : [];
            const alreadyLiked = likes.includes(userId);
            console.log('Updating likes:', { alreadyLiked, newLikes: alreadyLiked ? likes.filter((id) => id !== userId) : [...likes, userId] });
            return {
              ...comment,
              likes: alreadyLiked ? likes.filter((id) => id !== userId) : [...likes, userId],
            };
          }
          return comment;
        })
      );
      return { previousComments, commentId };
    },
    onSuccess: (updatedComment) => {
      console.log('Like success:', { commentId: updatedComment._id, likes: updatedComment.likes });
      queryClient.setQueryData<Comment[]>(['comments', postId, type], (old = []) =>
        old.map((comment) =>
          comment._id === updatedComment._id
            ? { ...comment, likes: updatedComment.likes || [] }
            : comment
        )
      );
      // Force refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['comments', postId, type] });
    },
    // onError: (err: Error, commentId: string, context: { previousComments: Comment[]; commentId: string } | undefined) => {
    //   console.error('Like error:', err);
    //   toast({
    //     title: 'Error liking comment',
    //     description: err.message.includes('not found')
    //       ? 'The post, product, or comment no longer exists.'
    //       : err.message || 'Failed to like comment. Please try again.',
    //     variant: 'destructive',
    //     action: !err.message.includes('not found') ? (
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         onClick={() => likeCommentMutation.mutate(commentId)}
    //         aria-label="Retry liking comment"
    //       >
    //         Retry
    //       </Button>
    //     ) : undefined,
    //   });
    //   // Revert optimistic update on error
    //   queryClient.setQueryData<Comment[]>(['comments', postId, type], context?.previousComments);
    // },
  });

  return {
    comments,
    isLoading,
    error,
    refetch,
    addComment: commentMutation.mutate,
    likeComment: likeCommentMutation.mutate,
  };
};