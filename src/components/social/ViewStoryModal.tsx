
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Story } from '@/types/story';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ViewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStory: Story | null;
  currentStoryIndex: number;
  storiesCount: number;
  onNextStory: () => void;
  onPrevStory: () => void;
}

const ViewStoryModal = ({
  isOpen,
  onClose,
  currentStory,
  currentStoryIndex,
  storiesCount,
  onNextStory,
  onPrevStory
}: ViewStoryModalProps) => {
  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStory._id?.toString()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-[70vh]"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
              {Array.from({ length: storiesCount }).map((_, i) => (
                <div 
                  key={i}
                  className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden"
                >
                  {i === currentStoryIndex && (
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  )}
                  {i < currentStoryIndex && (
                    <div className="h-full bg-white w-full" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center space-x-2 pt-6">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={currentStory.user.avatar} alt={currentStory.user.name} />
                <AvatarFallback>{currentStory.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">{currentStory.user.name}</span>
            </div>
            
            <img 
              src={currentStory.image} 
              alt="Story" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start" onClick={onPrevStory}>
              {currentStoryIndex > 0 && (
                <div className="h-full cursor-pointer" />
              )}
            </div>
            <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end" onClick={onNextStory}>
              <div className="h-full cursor-pointer" />
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ViewStoryModal;
