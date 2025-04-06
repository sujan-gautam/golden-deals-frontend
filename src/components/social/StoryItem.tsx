
import React from 'react';
import { Story } from '@/types/story';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StoryItemProps {
  story: Story;
  index: number;
  onViewStory: (story: Story, index: number) => void;
}

const StoryItem = ({ story, index, onViewStory }: StoryItemProps) => {
  // Format the time
  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative snap-start"
    >
      <button 
        onClick={() => onViewStory(story, index)}
        className="relative w-28 h-40 rounded-3xl overflow-hidden shadow-lg focus:outline-none group"
        style={{ willChange: 'transform' }}
      >
        {/* Colorful top border gradient based on viewed status */}
        <div className={`absolute inset-x-0 top-0 h-1.5 z-20 ${story.isViewed ? 'bg-gray-300' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`}></div>
        
        {/* Shimmering overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 mix-blend-overlay group-hover:opacity-80 z-10 opacity-0 transition-opacity"></div>
        
        {/* Subtle shine effect on hover */}
        <div className="absolute -inset-full h-full w-1/2 z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
        
        {/* Background image */}
        <img 
          src={story.image} 
          alt={story.user.name} 
          className="w-full h-full object-cover transition-transform duration-10000 ease-out group-hover:scale-110"
        />
        
        {/* User avatar with interactive ring */}
        <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
          <div className={`w-12 h-12 rounded-full p-1 ${story.isViewed ? 'bg-gray-300' : 'bg-gradient-to-br from-primary to-purple-500'}`}>
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
              <img 
                src={story.user.avatar} 
                alt={story.user.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Story time */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1 z-20">
          <Clock className="h-3 w-3 text-white/70" />
          <span className="text-[10px] text-white/90 font-medium">
            {timeAgo}
          </span>
        </div>
      </button>
      
      {/* Username display */}
      <div className="mt-2 text-center">
        <span className="text-xs font-medium text-gray-700 truncate block">
          {story.user.name.split(' ')[0]}
        </span>
      </div>
    </motion.div>
  );
};

export default StoryItem;
