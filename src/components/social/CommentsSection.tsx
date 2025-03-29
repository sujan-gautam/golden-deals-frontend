
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatDistance } from 'date-fns';
import { Heart, Reply, MoreHorizontal, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getComments, commentOnPost } from '@/services/api';
import { idToString } from '@/types/post';
import { CommentDisplay } from '@/types/comment';

interface CommentsProps {
  postId: string;
  initialComments?: CommentDisplay[];
  onComment?: (content?: string) => void;
}

const CommentsSection = ({ postId, initialComments = [], onComment }: CommentsProps) => {
  const [comments, setComments] = useState<CommentDisplay[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchComments = async () => {
      if (initialComments.length === 0) {
        setIsLoading(true);
        try {
          const fetchedComments = await getComments(postId);
          const formattedComments = fetchedComments.map((comment: any) => formatComment(comment));
          setComments(formattedComments);
        } catch (error) {
          console.error('Error fetching comments:', error);
          // Show empty state on error
          setComments([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchComments();
  }, [postId, initialComments]);

  const formatComment = (comment: any): CommentDisplay => {
    const formattedComment: CommentDisplay = {
      id: idToString(comment._id),
      user: {
        id: idToString(comment.user?._id || comment.userId),
        name: comment.user?.name || 'Unknown User',
        avatar: comment.user?.avatar || 'https://i.pravatar.cc/300',
      },
      content: comment.content,
      likes: Array.isArray(comment.likes) ? comment.likes.length : 0,
      liked: Array.isArray(comment.likes) && currentUser._id ? 
        comment.likes.includes(currentUser._id) : false,
      createdAt: comment.createdAt,
    };

    if (comment.replies && Array.isArray(comment.replies)) {
      formattedComment.replies = comment.replies.map((reply: any) => formatComment(reply));
    }

    return formattedComment;
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    // Call the API to add a comment
    commentOnPost(postId, newComment)
      .then((response) => {
        // Notify parent component if needed
        if (onComment) {
          onComment(newComment);
        }
        
        // Add the new comment to the UI
        const newCommentObj: CommentDisplay = {
          id: idToString(response._id || `local-comment-${Date.now()}`),
          user: {
            id: currentUser._id || 'current-user',
            name: currentUser.name || 'You',
            avatar: currentUser.avatar || 'https://i.pravatar.cc/300?img=8',
          },
          content: newComment,
          likes: 0,
          liked: false,
          createdAt: new Date().toISOString(),
          replies: [],
        };
        
        setComments([newCommentObj, ...comments]);
        setNewComment('');
        
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        });
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleAddReply = (commentId: string) => {
    const replyContent = replyText[commentId];
    if (!replyContent?.trim()) return;
    
    setIsSubmitting(true);
    
    // Call the API to add a reply
    commentOnPost(postId, replyContent, commentId)
      .then((response) => {
        const newReply: CommentDisplay = {
          id: idToString(response._id || `local-reply-${Date.now()}`),
          user: {
            id: currentUser._id || 'current-user',
            name: currentUser.name || 'You',
            avatar: currentUser.avatar || 'https://i.pravatar.cc/300?img=8',
          },
          content: replyContent,
          likes: 0,
          liked: false,
          createdAt: new Date().toISOString(),
        };
        
        // Update the comments state with the new reply
        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        }));
        
        // Clear the reply text for this comment
        setReplyText({...replyText, [commentId]: ''});
        
        toast({
          title: "Reply added",
          description: "Your reply has been posted successfully.",
        });
      })
      .catch((error) => {
        console.error('Error adding reply:', error);
        toast({
          title: "Error",
          description: "Failed to add reply. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const toggleLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newLiked = !comment.liked;
        return {
          ...comment,
          liked: newLiked,
          likes: newLiked ? comment.likes + 1 : comment.likes - 1,
        };
      }
      
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              const newLiked = !reply.liked;
              return {
                ...reply,
                liked: newLiked,
                likes: newLiked ? reply.likes + 1 : reply.likes - 1,
              };
            }
            return reply;
          })
        };
      }
      
      return comment;
    }));
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies({
      ...showReplies,
      [commentId]: !showReplies[commentId]
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: CommentDisplay, isReply?: boolean }) => (
    <div className={`flex space-x-3 ${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
          <div className="font-medium text-sm">{comment.user.name}</div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
          <span>{formatTimeAgo(comment.createdAt)}</span>
          
          <button 
            onClick={() => toggleLike(comment.id)}
            className={`font-medium ${comment.liked ? 'text-red-500' : ''}`}
          >
            {comment.likes > 0 ? `${comment.likes} Likes` : 'Like'}
          </button>
          
          {!isReply && (
            <button 
              className="font-medium"
              onClick={() => toggleReplies(comment.id)}
            >
              Reply
            </button>
          )}
        </div>
        
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <button 
            className="text-xs text-primary font-medium mt-1"
            onClick={() => toggleReplies(comment.id)}
          >
            {showReplies[comment.id] 
              ? `Hide ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
              : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
        
        {!isReply && showReplies[comment.id] && (
          <div className="mt-2">
            {comment.replies?.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
            
            <div className="flex items-center mt-3 ml-12">
              <Avatar className="h-7 w-7 mr-2">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="w-full py-1.5 px-3 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-8"
                  value={replyText[comment.id] || ''}
                  onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddReply(comment.id);
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => handleAddReply(comment.id)}
                  disabled={isSubmitting || !replyText[comment.id]?.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toggleLike(comment.id)}>
            {comment.liked ? 'Unlike' : 'Like'}
          </DropdownMenuItem>
          {!isReply && (
            <DropdownMenuItem onClick={() => toggleReplies(comment.id)}>
              Reply
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">Report</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="pt-3">
      <Separator className="mb-4" />
      
      <div className="flex items-center space-x-3 mb-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleAddComment}
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse flex space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-full max-w-md"></div>
            </div>
          </div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Be the first to comment on this post
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
