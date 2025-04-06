
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Story } from '@/types/story';
import StoryItem from './StoryItem';
import AddStoryButton from './AddStoryButton';
import CreateStoryModal from './CreateStoryModal';
import ViewStoryModal from './ViewStoryModal';
import { getStories, createStory, viewStory } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';

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
        setStories(data || []);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load stories",
          variant: "destructive",
        });
        // Set empty array on error to prevent crashes
        setStories([]);
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
      <div className="mb-8">
        <h2 className="text-lg font-semibold ml-1 mb-3 text-gray-800">Stories</h2>
        <div className="flex overflow-x-auto pb-2 space-x-4 scrollbar-hide">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="relative flex-shrink-0 animate-pulse">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-200"></div>
              <div className="mt-2 w-16 h-3 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <motion.div 
      className="mb-8 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2 className="text-lg font-semibold ml-1 mb-3 text-gray-800">Stories</h2>
      
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -left-8 -top-8 w-16 h-16 bg-gradient-to-r from-primary/20 to-purple-300/20 rounded-full blur-xl"></div>
        <div className="absolute -right-4 top-6 w-12 h-12 bg-gradient-to-l from-blue-300/20 to-primary/20 rounded-full blur-xl"></div>
        
        {/* Stories container with glass effect */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex overflow-x-auto pb-2 space-x-4 scrollbar-hide">
            <motion.div variants={itemVariants}>
              <AddStoryButton onAddStory={handleAddStory} />
            </motion.div>
            
            {stories && stories.length > 0 ? (
              stories.map((story, index) => (
                <motion.div key={story._id?.toString() || index} variants={itemVariants}>
                  <StoryItem 
                    story={story}
                    index={index}
                    onViewStory={viewStoryHandler}
                  />
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-4 text-gray-500">
                <motion.p 
                  variants={itemVariants}
                  className="italic text-sm"
                >
                  No stories yet. Be the first to add one!
                </motion.p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateStoryModal 
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onCreateStory={handleCreateStory}
      />
      
      {stories && stories.length > 0 && (
        <ViewStoryModal 
          isOpen={isViewStoryOpen}
          onClose={() => setIsViewStoryOpen(false)}
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
        />
      )}
    </motion.div>
  );
};

export default StoriesSection;
