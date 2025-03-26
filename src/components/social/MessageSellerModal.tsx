
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Clock } from 'lucide-react';

interface MessageSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  productName?: string;
}

const MessageSellerModal = ({ isOpen, onClose, seller, productName }: MessageSellerModalProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending message
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Message sent!",
        description: `Your message to ${seller.name} has been sent.`,
      });
      setMessage('');
      onClose();
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Seller</DialogTitle>
          <DialogDescription>
            Contact {seller.name} {productName ? `about "${productName}"` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start space-x-3 mb-4 pt-2">
          <Avatar>
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{seller.name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Usually responds within a few hours
            </div>
          </div>
        </div>

        <Textarea
          placeholder={productName 
            ? `Ask about "${productName}" or request more details...` 
            : "Write your message here..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px]"
        />

        <div className="text-xs text-gray-500 mt-2">
          Please be specific in your inquiry. Mention any questions about condition, pickup options, or other details.
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage} disabled={isSending} className="gap-2">
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSellerModal;
