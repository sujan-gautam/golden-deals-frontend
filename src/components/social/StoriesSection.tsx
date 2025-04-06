
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
import { Sparkles } from 'lucide-react';

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
        <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
          <Sparkles className="mr-2 h-4 w-4 text-primary/70" />
          Moments
        </h2>
        <div className="flex overflow-x-auto pb-2 space-x-4 scrollbar-hide">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="relative flex-shrink-0 animate-pulse">
              <div className="w-28 h-40 rounded-3xl bg-gray-200"></div>
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
      <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
        <Sparkles className="mr-2 h-4 w-4 text-primary/70" />
        Moments
      </h2>
      
      <motion.div
        className="relative overflow-visible py-4 px-1"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative elements */}
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute right-12 top-10 w-32 h-32 bg-gradient-to-l from-primary/10 to-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-300/10 rounded-full blur-3xl"></div>
        
        {/* Horizontal scrolling stories container */}
        <div className="relative z-10 flex gap-4 py-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          <div className="pl-1 snap-start">
            <AddStoryButton onAddStory={handleAddStory} />
          </div>
          
          {stories && stories.length > 0 ? (
            stories.map((story, index) => (
              <motion.div 
                key={story._id?.toString() || index} 
                variants={itemVariants}
                className="snap-start"
              >
                <StoryItem 
                  story={story}
                  index={index}
                  onViewStory={viewStoryHandler}
                />
              </motion.div>
            ))
          ) : (
            <div className="flex items-center justify-center min-w-[200px] py-4">
              <motion.p 
                variants={itemVariants}
                className="italic text-sm text-gray-400"
              >
                Share your first moment!
              </motion.p>
            </div>
          )}
        </div>
      </motion.div>
      
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
