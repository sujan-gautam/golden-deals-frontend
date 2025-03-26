
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

interface BrandedLikeButtonProps {
  initialLikes: number;
  isLiked?: boolean;
  onLike?: (liked: boolean) => void;
}

const BrandedLikeButton = ({ initialLikes = 0, isLiked = false, onLike }: BrandedLikeButtonProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(initialLikes);
  
  const toggleLike = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
    
    if (onLike) {
      onLike(newLikedState);
    }
  };
  
  return (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`rounded-full p-0 h-9 w-9 flex items-center justify-center transition-colors ${
          liked ? 'bg-primary/10 text-primary' : ''
        }`}
        onClick={toggleLike}
      >
        <AnimatePresence mode="wait">
          {liked ? (
            <motion.svg 
              key="filled"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="h-5 w-5 fill-primary" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.8197L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" />
            </motion.svg>
          ) : (
            <motion.svg 
              key="outline"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.8197L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </Button>
      <span className="text-sm font-medium">{likes}</span>
    </div>
  );
};

export default BrandedLikeButton;
