import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useComments } from '@/hooks/use-comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Comment } from '@/types/comment';
import { useAuth } from '@/hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import CommentLikeButton from './CommentLikeButton';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  type: 'post' | 'product' | 'event';
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, postId, type }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyStates, setReplyStates] = useState<{ [key: string]: { isReplying: boolean; content: string } }>({});
  const [visibleReplies, setVisibleReplies] = useState<{ [key: string]: boolean }>({});
  const { comments, isLoading, error, addComment, likeComment, refetch } = useComments({
    postId,
    type,
    onAuthRequired: () => {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, postId, type, refetch]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleAddComment = (parentId?: string) => {
    if (!newComment.trim() && !parentId) return;
    if (!replyStates[parentId || '']?.content.trim() && parentId) return;

    const content = parentId ? replyStates[parentId].content : newComment;
    const mentions = extractMentions(content);
    console.log('Posting comment:', { postId, content, parentId, mentions });

    addComment(
      { content, parentId, mentions },
      {
        onSuccess: () => {
          setNewComment('');
          if (parentId) {
            setReplyStates((prev) => ({
              ...prev,
              [parentId]: { isReplying: false, content: '' },
            }));
            setVisibleReplies((prev) => ({ ...prev, [parentId]: true }));
          }
          refetch();
          toast({
            title: 'Comment Posted',
            description: 'Your comment has been added.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to post comment. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to like comments.',
        variant: 'destructive',
      });
      return;
    }

    // Optimistically update the comments query
    const queryKey = ['comments', postId, type];
    const previousComments = queryClient.getQueryData<Comment[]>(queryKey) || [];
    const userId = user._id;

    queryClient.setQueryData<Comment[]>(queryKey, (old = []) =>
      old.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likes: Array.isArray(comment.likes)
                ? comment.likes.includes(userId)
                  ? comment.likes.filter((id) => id !== userId)
                  : [...comment.likes, userId]
                : comment.likes.includes(userId)
                ? []
                : [userId],
            }
          : comment
      )
    );

    try {
      await likeComment(commentId);
      toast({
        title: 'Success',
        description: 'Comment like updated.',
      });
    } catch (error: any) {
      // Revert on error
      queryClient.setQueryData(queryKey, previousComments);
      toast({
        title: 'Error',
        description: error.message || 'Failed to like comment.',
        variant: 'destructive',
      });
    }
  };

  const toggleReply = (commentId: string) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        isReplying: !prev[commentId]?.isReplying,
        content: prev[commentId]?.content || '',
      },
    }));
  };

  const handleReplyChange = (commentId: string, content: string) => {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: { ...prev[commentId], content },
    }));
  };

  const toggleReplies = (commentId: string) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map((m) => m.slice(1)) : [];
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isLiked = user && comment.likes.includes(user._id);
    const likesCount = Array.isArray(comment.likes) ? comment.likes.length : 0;
    const replies = comments.filter((c) => c.parentId === comment._id);
    const areRepliesVisible = visibleReplies[comment._id] || false;
    const avatarFallback = comment.user.name
      ? comment.user.name.charAt(0)
      : comment.user.username
      ? comment.user.username.charAt(0)
      : 'A';

    return (
      <div
        key={comment._id}
        className={`relative flex space-x-3 mt-4 ${depth > 0 ? 'ml-6' : ''}`}
        role="treeitem"
        aria-level={depth + 1}
      >
        {replies.length > 0 && areRepliesVisible && (
          <div
            className="absolute left-0 top-12 bottom-0 w-px bg-gray-200"
            style={{ left: '1.5rem', transform: 'translateX(-50%)' }}
            aria-hidden="true"
          />
        )}
        <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar} alt={comment.user.name || comment.user.username || 'User'} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
            <Link to={`/profile/${comment.userId}`} className="font-semibold text-sm hover:underline">
              {comment.user.name || comment.user.username || 'Anonymous'}
            </Link>
            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
            <div className="text-xs text-gray-500 mt-1">
              {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <CommentLikeButton
              onLike={() => handleLikeComment(comment._id)}
              isLiked={isLiked}
              initialLikes={likesCount}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReply(comment._id)}
              className="flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>
          {replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment._id)}
              className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
              aria-expanded={areRepliesVisible}
              aria-label={areRepliesVisible ? `Hide ${replies.length} replies` : `Show ${replies.length} replies`}
            >
              {areRepliesVisible ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide replies ({replies.length})
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View replies ({replies.length})
                </>
              )}
            </Button>
          )}
          {replyStates[comment._id]?.isReplying && (
            <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-4">
              <Textarea
                value={replyStates[comment._id].content}
                onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                placeholder={`Reply to ${comment.user.name || comment.user.username || 'user'}...`}
                className="w-full text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => handleAddComment(comment._id)}>
                  Post Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleReply(comment._id)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {replies.length > 0 && areRepliesVisible && (
            <div
              className="mt-2 relative"
              role="group"
              aria-label={`Replies to comment by ${comment.user.name || comment.user.username}`}
            >
              {replies.map((reply) => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comment-modal-title"
    >
      <div className="relative bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h4 id="comment-modal-title" className="text-lg font-semibold text-gray-800">
            Comments for {type.charAt(0).toUpperCase() + type.slice(1)}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close comment modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <div className="p-4">
          {error ? (
            <div className="text-red-600">
              <p>Failed to load comments: {error.message}</p>
              <Button variant="outline" onClick={() => navigate(`/${type}s`)}>
                Back to {type.charAt(0).toUpperCase() + type.slice(1)}s
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
          ) : (
            <div role="tree" aria-label="Comment thread">
              {comments
                .filter((comment) => !comment.parentId)
                .map((comment) => renderComment(comment))}
            </div>
          )}
          <div className="mt-4 sticky bottom-0 bg-white pt-2 pb-4 z-10">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isAuthenticated ? 'Write a comment...' : 'Sign in to comment'}
              className="w-full text-sm"
              disabled={!isAuthenticated}
              rows={3}
            />
            <Button
              className="mt-2"
              onClick={() => handleAddComment()}
              disabled={!newComment.trim() || !isAuthenticated}
            >
              Post Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;