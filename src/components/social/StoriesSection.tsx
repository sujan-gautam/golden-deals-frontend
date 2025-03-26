
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Story } from '@/types/story';
import StoryItem from './StoryItem';
import AddStoryButton from './AddStoryButton';
import CreateStoryModal from './CreateStoryModal';
import ViewStoryModal from './ViewStoryModal';

const StoriesSection = () => {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      user: {
        id: '101',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/300?img=1',
      },
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      user: {
        id: '102',
        name: 'Marcus Lee',
        avatar: 'https://i.pravatar.cc/300?img=3',
      },
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      user: {
        id: '103',
        name: 'Jamie Rodriguez',
        avatar: 'https://i.pravatar.cc/300?img=10',
      },
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
      createdAt: new Date().toISOString(),
    },
  ]);
  
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isViewStoryOpen, setIsViewStoryOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleAddStory = () => {
    setIsCreateStoryOpen(true);
  };
  
  const handleCreateStory = (storyImage: string, storyText: string, storyTextColor: string) => {
    const newStory: Story = {
      id: Date.now().toString(),
      user: {
        id: user.id || 'current-user',
        name: user.name || 'Current User',
        avatar: user.avatar || 'https://i.pravatar.cc/300?img=8',
      },
      image: storyImage,
      createdAt: new Date().toISOString(),
    };
    
    setStories(prev => [newStory, ...prev]);
    setIsCreateStoryOpen(false);
    
    toast({
      title: "Story created!",
      description: "Your story has been published.",
    });
  };
  
  const viewStory = (story: Story, index: number) => {
    setCurrentStory(story);
    setCurrentStoryIndex(index);
    setIsViewStoryOpen(true);
    
    // Auto-close story after 5 seconds
    setTimeout(() => {
      if (index < stories.length - 1) {
        viewStory(stories[index + 1], index + 1);
      } else {
        setIsViewStoryOpen(false);
      }
    }, 5000);
  };
  
  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      viewStory(stories[currentStoryIndex + 1], currentStoryIndex + 1);
    } else {
      setIsViewStoryOpen(false);
    }
  };
  
  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      viewStory(stories[currentStoryIndex - 1], currentStoryIndex - 1);
    }
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-md font-semibold ml-1 mb-2">Stories</h2>
      <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
        <AddStoryButton onAddStory={handleAddStory} />
        
        {stories.map((story, index) => (
          <StoryItem 
            key={story.id}
            story={story}
            index={index}
            onViewStory={viewStory}
          />
        ))}
      </div>
      
      <CreateStoryModal 
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onCreateStory={handleCreateStory}
      />
      
      <ViewStoryModal 
        isOpen={isViewStoryOpen}
        onClose={() => setIsViewStoryOpen(false)}
        currentStory={currentStory}
        currentStoryIndex={currentStoryIndex}
        storiesCount={stories.length}
        onNextStory={handleNextStory}
        onPrevStory={handlePrevStory}
      />
    </div>
  );
};

export default StoriesSection;
