// src/components/social/CommentLikeButton.tsx
import React, { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

interface CommentLikeButtonProps {
  onLike: () => void;
  isLiked: boolean;
  initialLikes: number;
  className?: string;
}

const CommentLikeButton = ({ onLike, isLiked, initialLikes, className }: CommentLikeButtonProps) => {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const toggleLike = useCallback(() => {
    console.log('Toggle like, isLiked:', isLiked); // Debug
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);
    onLike();
  }, [onLike, isLiked]);

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full p-0 h-9 w-9 flex items-center justify-center transition-colors ${
          isLiked ? 'bg-yellow-500/10 text-yellow-500' : ''
        } ${className || ''}`}
        onClick={toggleLike}
        aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
      >
        <AnimatePresence mode="wait">
          {isLiked ? (
            <motion.div
              key="filled"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative"
            >
              <motion.svg
                className="h-5 w-5 fill-yellow-500"
                viewBox="0 0 24 24"
                initial={{ rotate: -20 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <path d="M12 2L14.2451 8.90983H21.5106L15.6327 13.1803L17.8779 20.0902L12 15.8197L6.12215 20.0902L8.36729 13.1803L2.48944 8.90983H9.75486L12 2Z" />
              </motion.svg>

              {showLikeAnimation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-yellow-500"
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos(i * Math.PI / 4) * 10,
                        y: Math.sin(i * Math.PI / 4) * 10,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.svg
              key="outline"
              initial={{ scale: 1 }}
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
      <AnimatePresence mode="wait">
        <motion.span
          key={initialLikes}
          className="text-sm font-medium"
          initial={{ scale: 0.8, opacity: 0, y: 5 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -5 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {initialLikes}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default CommentLikeButton;