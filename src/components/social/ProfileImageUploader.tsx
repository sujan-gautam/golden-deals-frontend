
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  currentImage?: string;
  username?: string;
}

const ProfileImageUploader = ({
  isOpen,
  onClose,
  onSave,
  currentImage,
  username = 'U',
}: ProfileImageUploaderProps) => {
  const [image, setImage] = useState<string | undefined>(currentImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For demo purposes, simulate file upload with URL prompt
  const handleImageSelect = () => {
    const imageUrl = prompt('Enter an image URL:');
    if (imageUrl) {
      setImage(imageUrl);
    }
  };
  
  const handleSubmit = () => {
    if (!image) return;
    
    setIsSubmitting(true);
    
    // In a real app, this would be an API call to upload the image
    setTimeout(() => {
      onSave(image);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };
  
  const removeImage = () => {
    setImage(undefined);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {image ? (
            <div className="relative rounded-full overflow-hidden w-32 h-32">
              <img src={image} alt="Profile" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-0 right-0 h-8 w-8 p-0 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Avatar className="w-32 h-32">
              <AvatarImage src={currentImage} alt={username} />
              <AvatarFallback className="text-3xl">{username.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          
          <Button onClick={handleImageSelect} variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Select New Image
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!image || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImageUploader;
