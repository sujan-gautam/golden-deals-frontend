
import React from 'react';
import { Story } from '@/types/story';

interface StoryItemProps {
  story: Story;
  index: number;
  onViewStory: (story: Story, index: number) => void;
}

const StoryItem = ({ story, index, onViewStory }: StoryItemProps) => {
  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center"
      style={{ width: '80px' }}
    >
      <button 
        onClick={() => onViewStory(story, index)}
        className={`group rounded-full w-16 h-16 p-0 relative border-2 ${story.isViewed ? 'border-gray-300' : 'border-primary'} overflow-hidden mb-1`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all z-10" />
        <img 
          src={story.image} 
          alt="Story" 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </button>
      <span className="text-xs truncate w-full text-center">{story.user.name.split(' ')[0]}</span>
    </div>
  );
};

export default StoryItem;
