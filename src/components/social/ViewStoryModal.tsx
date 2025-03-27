
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Story } from '@/types/story';
import { viewStory } from '@/services/api';
import { formatDistance } from 'date-fns';

interface ViewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex: number;
}

const ViewStoryModal: React.FC<ViewStoryModalProps> = ({
  isOpen,
  onClose,
  stories = [],  // Provide default empty array
  initialStoryIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Guard against empty stories array or invalid index
  const validIndex = stories.length > 0 ? Math.min(currentIndex, stories.length - 1) : 0;
  const currentStory = stories.length > 0 ? stories[validIndex] : null;
  
  useEffect(() => {
    if (!isOpen || !currentStory) return;
    
    // Mark story as viewed
    const markAsViewed = async () => {
      try {
        await viewStory(currentStory._id?.toString() || '');
      } catch (error) {
        console.error('Failed to mark story as viewed', error);
      }
    };
    
    markAsViewed();
    
    // Reset progress when story changes
    setProgress(0);
    
    // Auto-progress timer
    const storyDuration = 5000; // 5 seconds per story
    const interval = 100; // Update progress every 100ms
    const step = (interval / storyDuration) * 100;
    
    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          const newProgress = prev + step;
          
          // Move to next story when progress completes
          if (newProgress >= 100) {
            if (currentIndex < stories.length - 1) {
              setCurrentIndex(prev => prev + 1);
            } else {
              // Close modal when all stories are viewed
              clearInterval(timer);
              onClose();
            }
            return 0;
          }
          
          return newProgress;
        });
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [isOpen, currentStory, currentIndex, isPaused, stories.length, onClose]);
  
  if (!isOpen || !currentStory) return null;
  
  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full h-[80vh] max-h-[800px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition-colors"
          aria-label="Close story"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Progress bar */}
        <div className="absolute top-2 left-2 right-2 z-10 flex space-x-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              {index === currentIndex ? (
                <Progress value={progress} className="h-full" />
              ) : index < currentIndex ? (
                <div className="h-full w-full bg-white" />
              ) : null}
            </div>
          ))}
        </div>
        
        {/* User info */}
        <div className="absolute top-6 left-4 right-4 z-10 flex items-center">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={currentStory.user.avatar} />
            <AvatarFallback>{currentStory.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-3 text-white">
            <div className="font-semibold">{currentStory.user.name}</div>
            <div className="text-xs opacity-80">{formatTimeAgo(currentStory.createdAt)}</div>
          </div>
        </div>
        
        {/* Story content */}
        <div 
          className="h-full w-full bg-gray-900 rounded-lg overflow-hidden"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <img 
            src={currentStory.image} // Use image instead of media to match Story type
            alt="Story" 
            className="h-full w-full object-contain"
          />
        </div>
        
        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition-colors"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition-colors"
            aria-label="Next story"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewStoryModal;
