import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Send, Clock, AlertCircle } from 'lucide-react';
import { createConversation, sendMessage } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatar: string;
  };
  event?: {
    _id: string;
    title: string;
  };
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, recipient, event }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  // Check if the current user is the recipient
  const isOwnRecipient = user && recipient.id === user.id;

  // Construct avatar URL
  const avatarSrc = recipient.avatar
    ? recipient.avatar.startsWith('http')
      ? recipient.avatar
      : `${IMAGE_URL}${recipient.avatar}`
    : undefined;

  // Debug data
  console.log('ChatModal - Recipient:', recipient);
  console.log('ChatModal - Raw avatar:', recipient.avatar);
  console.log('ChatModal - Constructed avatarSrc:', avatarSrc);
  console.log('ChatModal - Event:', event);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }
    if (!isAuthenticated || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in to send a message.',
        variant: 'destructive',
      });
      return;
    }
    if (!recipient.id || !/^[0-9a-fA-F]{24}$/.test(recipient.id)) {
      console.error('ChatModal - Invalid recipient ID:', recipient.id);
      toast({
        title: 'Error',
        description: 'Invalid recipient ID.',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);
    try {
      console.log('ChatModal - Creating conversation with recipient ID:', recipient.id);
      const conversation = await createConversation(recipient.id);
      const conversationId = conversation._id;
      const messageData = {
        conversationId,
        content: message,
        event: event
          ? {
              _id: event._id,
              title: event.title,
            }
          : undefined,
      };
      console.log('ChatModal - Sending message to conversation:', conversationId, 'Data:', messageData);
      await sendMessage(messageData);
      toast({
        title: 'Message sent!',
        description: `Your message to ${recipient.name}${event ? ` about "${event.title}"` : ''} has been sent.`,
      });
      setMessage('');
      onClose();
      navigate(`/messages/${conversationId}`);
    } catch (error: any) {
      console.error('ChatModal - Error sending message:', error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50 rounded-xl">
        <DialogHeader>
          <DialogTitle>Message User</DialogTitle>
          <DialogDescription>
            Contact {recipient.name}{event ? ` about "${event.title}"` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start space-x-3 mb-4 pt-2">
          <Avatar>
            <AvatarImage
              src={avatarSrc}
              alt={recipient.name}
              onError={() => console.error('ChatModal - Failed to load avatar:', avatarSrc)}
            />
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {recipient.name.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{recipient.name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Usually responds within a few hours
            </div>
          </div>
        </div>
        {isOwnRecipient ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="h-8 w-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              You cannot message yourself. This is your own event.
            </p>
          </div>
        ) : (
          <>
            <Textarea
              placeholder={event ? `Ask about "${event.title}" or request more details...` : 'Write your message here...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isOwnRecipient}
            />
            <div className="text-xs text-gray-500 mt-2">
              Please be specific in your inquiry. Mention any questions about the event or other details.
            </div>
          </>
        )}
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isOwnRecipient && (
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;