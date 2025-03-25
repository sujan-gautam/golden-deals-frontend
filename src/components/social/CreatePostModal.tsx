
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: { content: string; image?: string }) => void;
}

const CreatePostModal = ({ isOpen, onClose, onSubmit }: CreatePostModalProps) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    // In a real app, we'd upload the image and get a URL
    onSubmit({
      content,
      image,
    });
    
    // Reset form
    setContent('');
    setImage(undefined);
    setIsSubmitting(false);
  };
  
  // For demo purposes, let's simulate image upload by allowing URLs
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would be an actual file upload
    // For now, we'll just prompt the user for an image URL
    const imageUrl = prompt('Enter an image URL:');
    if (imageUrl) {
      setImage(imageUrl);
    }
  };
  
  const removeImage = () => {
    setImage(undefined);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">Posting to your feed</div>
            </div>
          </div>
          
          <textarea
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-usm-gold min-h-[120px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          
          {image && (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={image} alt="Post attachment" className="w-full max-h-60 object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={handleImageUpload}>
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </div>
            
            <Button type="submit" disabled={!content.trim() || isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
