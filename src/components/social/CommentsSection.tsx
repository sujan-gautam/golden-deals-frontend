// src/components/social/CommentsSection.tsx
import React, { useState, useEffect } from 'react';
import { useComments } from '@/hooks/use-comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, ThumbsUp, Loader2 } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Comment } from '@/types/comment';
import { useAuth } from '@/hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import CommentLikeButton from './CommentLikeButton';

interface CommentsSectionProps {
  postId: string;
  type: 'post' | 'product' | 'event';
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, type }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [replyStates, setReplyStates] = useState<{ [key: string]: { isReplying: boolean; content: string } }>({});
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
    refetch();
  }, [postId, type, refetch]);

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

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId, {
      onSuccess: () => {
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to like comment. Please try again.',
          variant: 'destructive',
        });
      },
    });
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

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map((m) => m.slice(1)) : [];
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isLiked = user && comment.likes.includes(user._id);
    const replies = comments.filter((c) => c.parentId === comment._id);
    const avatarFallback = comment.user.name
      ? comment.user.name.charAt(0)
      : comment.user.username
      ? comment.user.username.charAt(0)
      : 'A';

    return (
      <div key={comment._id} className={`flex space-x-3 ${depth > 0 ? 'ml-8' : ''} mt-4`}>
        <Link to={`/profile/${comment.userId}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar} alt={comment.user.name || comment.user.username || 'User'} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-3">
            <Link to={`/profile/${comment.userId}`} className="font-semibold text-sm hover:underline">
              {comment.user.name || comment.user.username || 'Anonymous'}
            </Link>
            <p className="text-sm text-gray-700">{comment.content}</p>
            <div className="text-xs text-gray-500 mt-1">
              {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment._id)}
              disabled={!isAuthenticated}
            >
              <CommentLikeButton className={`h-4 w-4 mr-1 ${isLiked ? 'text-blue-500' : ''}`} />
              {comment.likes.length}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleReply(comment._id)}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>
          {replyStates[comment._id]?.isReplying && (
            <div className="mt-2">
              <Textarea
                value={replyStates[comment._id].content}
                onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                placeholder={`Reply to ${comment.user.name || comment.user.username || 'user'}...`}
                className="w-full"
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
          {replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="mt-4 text-red-600">
        <p>Failed to load comments: {error.message}</p>
        <Button variant="outline" onClick={() => navigate(`/${type}s`)}>
          Back to {type.charAt(0).toUpperCase() + type.slice(1)}s
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Comments</h4>
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
      ) : (
        comments
          .filter((comment) => !comment.parentId)
          .map((comment) => renderComment(comment))
      )}
      <div className="mt-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAuthenticated ? 'Write a comment...' : 'Sign in to comment'}
          className="w-full"
          disabled={!isAuthenticated}
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
  );
};

export default CommentsSection;