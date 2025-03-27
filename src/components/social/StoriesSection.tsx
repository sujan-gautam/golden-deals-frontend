
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Story } from '@/types/story';
import StoryItem from './StoryItem';
import AddStoryButton from './AddStoryButton';
import CreateStoryModal from './CreateStoryModal';
import ViewStoryModal from './ViewStoryModal';
import { getStories, createStory, viewStory } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';

const StoriesSection = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isViewStoryOpen, setIsViewStoryOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getStories();
        setStories(data);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load stories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [toast]);
  
  const handleAddStory = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a story",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreateStoryOpen(true);
  };
  
  const handleCreateStory = async (storyImage: string, storyText: string, storyTextColor: string) => {
    if (!user) return;
    
    try {
      const newStory: Partial<Story> = {
        image: storyImage,
        content: storyText,
        createdAt: new Date().toISOString(),
      };
      
      const createdStory = await createStory(newStory);
      setStories(prev => [createdStory, ...prev]);
      setIsCreateStoryOpen(false);
      
      toast({
        title: "Story created!",
        description: "Your story has been published.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create story",
        variant: "destructive",
      });
    }
  };
  
  const viewStoryHandler = (story: Story, index: number) => {
    setSelectedStoryIndex(index);
    setIsViewStoryOpen(true);
  };
  
  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-md font-semibold ml-1 mb-2">Stories</h2>
        <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <h2 className="text-md font-semibold ml-1 mb-2">Stories</h2>
      <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
        <AddStoryButton onAddStory={handleAddStory} />
        
        {stories.map((story, index) => (
          <StoryItem 
            key={story._id?.toString()}
            story={story}
            index={index}
            onViewStory={viewStoryHandler}
          />
        ))}
        
        {stories.length === 0 && (
          <div className="flex items-center justify-center w-full py-4 text-gray-500">
            No stories yet. Be the first to add one!
          </div>
        )}
      </div>
      
      <CreateStoryModal 
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onCreateStory={handleCreateStory}
      />
      
      <ViewStoryModal 
        isOpen={isViewStoryOpen}
        onClose={() => setIsViewStoryOpen(false)}
        stories={stories}
        initialStoryIndex={selectedStoryIndex}
      />
    </div>
  );
};

export default StoriesSection;
