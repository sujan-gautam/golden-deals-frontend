
import React from 'react';
import { Story } from '@/types/story';
import { motion } from 'framer-motion';

interface StoryItemProps {
  story: Story;
  index: number;
  onViewStory: (story: Story, index: number) => void;
}

const StoryItem = ({ story, index, onViewStory }: StoryItemProps) => {
  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center"
      style={{ width: '90px' }}
    >
      <button 
        onClick={() => onViewStory(story, index)}
        className="group relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
      >
        {/* Border ring that indicates if viewed or not */}
        <div className={`absolute inset-0 border-3 ${story.isViewed ? 'border-gray-300' : 'border-gradient-to-r from-primary to-blue-400'} rounded-xl z-10`}></div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-70 group-hover:opacity-60 transition-opacity"></div>
        
        {/* Background image */}
        <img 
          src={story.image} 
          alt="Story" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* User avatar if needed */}
        {story.user.avatar && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white overflow-hidden z-20">
            <img 
              src={story.user.avatar} 
              alt={story.user.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </button>
      
      {/* Username display */}
      <span className="mt-2 text-xs font-medium text-gray-700 truncate w-full text-center">
        {story.user.name.split(' ')[0]}
      </span>
    </div>
  );
};

export default StoryItem;
