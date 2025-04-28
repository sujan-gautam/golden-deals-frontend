import React, { memo, useEffect } from 'react';
import { Story } from '@/types/story';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StoryItemProps {
  story: Story;
  index: number;
  onViewStory: (story: Story, index: number) => void;
}

const cardVariants = {
  hover: { y: -5 },
  tap: { scale: 0.98 },
};

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // In production, assume relative paths work with proxy
  : 'http://localhost:5000';

const StoryItem = memo(({ story, index, onViewStory }: StoryItemProps) => {
  useEffect(() => {
    // console.log('StoryItem received story:', story);
  }, [story]);

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
    } catch (error) {
      // console.error('Error formatting date:', error);
      return 'Recently';
    }
  };
  const timeAgo = getTimeAgo();

  const username = story.user_id?.username || story.user_id?.name?.split(' ')[0] || 'Unknown';

  const getImagePath = (image: Story['image']): string => {
    if (!image) return `${BASE_URL}/fallback-image.jpg`;
    const path = typeof image === 'string' ? image : image.path;
    if (!path) return `${BASE_URL}/fallback-image.jpg`;
    // Ensure absolute URL for development
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  const getAvatarPath = (avatar: string | undefined | null): string => {
    if (!avatar) return `${BASE_URL}/default-avatar.jpg`;
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `${BASE_URL}/fallback-image.jpg`;
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `${BASE_URL}/default-avatar.jpg`;
  };

  if (!story || !story.image) {
    return (
      <div className="w-28 h-40 flex items-center justify-center text-gray-500 text-xs">
        Story Unavailable
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative snap-start"
      initial={false}
    >
      <button
        onClick={() => onViewStory(story, index)}
        className="relative w-28 h-40 rounded-3xl overflow-hidden shadow-lg focus:outline-none group"
        style={{ willChange: 'transform' }}
        aria-label={`View ${username}'s story`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1.5 z-20 ${
            story.isViewed
              ? 'bg-gray-300'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-200" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 mix-blend-overlay group-hover:opacity-80 z-10 opacity-0 transition-opacity duration-200" />

        <div className="absolute -inset-full h-full w-1/2 z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />

        <img
          src={getImagePath(story.image)}
          alt={`${username}'s story`}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          loading="lazy"
          onError={handleImageError}
        />

        <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
          <div
            className={`w-12 h-12 rounded-full p-1 ${
              story.isViewed
                ? 'bg-gray-300'
                : 'bg-gradient-to-br from-primary to-purple-500'
            }`}
          >
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
              <img
                src={getAvatarPath(story.user_id?.avatar)}
                alt={`${username}'s avatar`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={handleAvatarError}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1 z-20">
          <Clock className="h-3 w-3 text-white/70" />
          <span className="text-[10px] text-white/90 font-medium">{timeAgo}</span>
        </div>
      </button>

      <div className="mt-2 text-center">
        <span className="text-xs font-medium text-gray-700 truncate block max-w-[112px]">
          {username}
        </span>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison to prevent unnecessary re-renders
  const prevStory = prevProps.story;
  const nextStory = nextProps.story;
  return (
    prevStory._id === nextStory._id &&
    prevStory.isViewed === nextStory.isViewed &&
    prevProps.index === nextProps.index &&
    prevStory.createdAt === nextStory.createdAt &&
    JSON.stringify(prevStory.user_id) === JSON.stringify(nextStory.user_id) &&
    JSON.stringify(prevStory.image) === JSON.stringify(nextStory.image)
  );
});

StoryItem.displayName = 'StoryItem';

export default StoryItem;