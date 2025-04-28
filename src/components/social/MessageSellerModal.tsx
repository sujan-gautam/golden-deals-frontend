// src/components/social/MessageSellerModal.tsx
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, 
} from "@/components/ui/dialog";
import { Send, Clock, AlertCircle } from 'lucide-react';
import { createConversation, sendMessage } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

interface MessageSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  product?: {
    _id: string;
    title: string;
    price?: number;
    image?: string;
    condition?: string;
    category?: string;
  };
}

const MessageSellerModal = ({ isOpen, onClose, seller, product }: MessageSellerModalProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Use VITE_IMAGE_URL consistent with other components
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:5000';

  // Check if the current user is the seller
  const isOwnProduct = user && seller.id === user.id;

  // Construct avatar URL, handling both relative and absolute URLs
  const avatarSrc = seller.avatar
    ? seller.avatar.startsWith('http')
      ? seller.avatar
      : `${IMAGE_URL}${seller.avatar}`
    : undefined;

  // Debug seller data
  console.log('MessageSellerModal - Seller:', seller);
  console.log('MessageSellerModal - Raw avatar:', seller.avatar);
  console.log('MessageSellerModal - Constructed avatarSrc:', avatarSrc);
  console.log('MessageSellerModal - Product:', product);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    if (!isAuthenticated || !user) {
      toast({
        title: "Error",
        description: "Please sign in to send a message.",
        variant: "destructive",
      });
      return;
    }
    if (!seller.id || !/^[0-9a-fA-F]{24}$/.test(seller.id)) {
      console.error('MessageSellerModal - Invalid seller ID:', seller.id);
      toast({
        title: "Error",
        description: "Invalid seller ID.",
        variant: "destructive",
      });
      return;
    }
    setIsSending(true);
    try {
      console.log('MessageSellerModal - Creating conversation with seller ID:', seller.id);
      const conversation = await createConversation(seller.id);
      const conversationId = conversation._id;
      const messageData = {
        conversationId,
        content: message,
        product: product
          ? {
              _id: product._id,
              title: product.title,
              price: product.price || null,
              image: product.image || null,
              condition: product.condition || null,
              category: product.category || null,
            }
          : undefined,
      };
      console.log('MessageSellerModal - Sending message to conversation:', conversationId, 'Data:', messageData);
      await sendMessage(messageData);
      toast({
        title: "Message sent!",
        description: `Your message to ${seller.name}${product ? ` about "${product.title}"` : ''} has been sent.`,
      });
      setMessage('');
      onClose();
      navigate(`/messages/${conversationId}`);
    } catch (error: any) {
      console.error('MessageSellerModal - Error sending message:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Seller</DialogTitle>
          <DialogDescription>
            Contact {seller.name}{product ? ` about "${product.title}"` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start space-x-3 mb-4 pt-2">
          <Avatar>
            <AvatarImage
              src={avatarSrc}
              alt={seller.name}
              onError={() => console.error('MessageSellerModal - Failed to load avatar:', avatarSrc)}
            />
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {seller.name.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{seller.name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Usually responds within a few hours
            </div>
          </div>
        </div>
        {isOwnProduct ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="h-8 w-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              You cannot message yourself. This is your own product listing.
            </p>
          </div>
        ) : (
          <>
            <Textarea
              placeholder={product ? `Ask about "${product.title}" or request more details...` : "Write your message here..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isOwnProduct}
            />
            <div className="text-xs text-gray-500 mt-2">
              Please be specific in your inquiry. Mention any questions about condition, pickup options, or other details.
            </div>
          </>
        )}
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isOwnProduct && (
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="gap-2 bg-usm-gold hover:bg-yellow-600"
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

export default MessageSellerModal;