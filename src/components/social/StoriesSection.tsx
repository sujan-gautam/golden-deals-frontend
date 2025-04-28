import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Story } from '@/types/story';
import StoryItem from './StoryItem';
import AddStoryButton from './AddStoryButton';
import CreateStoryModal from './CreateStoryModal';
import ViewStoryModal from './ViewStoryModal';
import { getStories, createStory } from '@/services/api';
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
  const userId = user?._id?.toString() || user?.id?.toString() || "";

  // Function to fetch stories
  const fetchStories = async () => {
    try {
      const data = await getStories();
      // console.log('Fetched stories:', data);
      setStories(data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load stories",
        variant: "destructive",
      });
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStories();

    // Set up interval to fetch stories every 1 minute (60,000 ms)
    const intervalId = setInterval(() => {
      fetchStories();
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [toast]); // toast is stable, so no unnecessary re-renders

  const { myStories, otherStories } = useMemo(() => {
    if (!isAuthenticated || !userId) {
      return { myStories: [], otherStories: stories };
    }
    const myStories = stories.filter((story) => {
      const storyUserId = story.user_id?._id?.toString() || story.user_id?.id?.toString() || story.user_id?.toString();
      return storyUserId === userId;
    });
    const otherStories = stories.filter((story) => {
      const storyUserId = story.user_id?._id?.toString() || story.user_id?.id?.toString() || story.user_id?.toString();
      return storyUserId !== userId;
    });
    return { myStories, otherStories };
  }, [stories, userId, isAuthenticated]);

  const sortedStories = useMemo(() => [...myStories, ...otherStories], [myStories, otherStories]);

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

  const handleCreateStory = async (storyImage: File, storyText: string, storyTextColor: string) => {
    if (!user) return;

    try {
      // console.log('handleCreateStory inputs:', { storyImage, storyText, storyTextColor });
      // console.log('Image details:', storyImage.name, storyImage.size, storyImage.type);

      const newStory: Partial<Story> & { imageFile: File } = {
        imageFile: storyImage,
        text: storyText,
        textColor: storyTextColor || '#ffffff',
      };

      const createdStory = await createStory(newStory);
      // console.log('Created story response:', createdStory);

      setStories(prev => [createdStory, ...prev]);
      setIsCreateStoryOpen(false);

      toast({
        title: "Story created!",
        description: "Your story has been shared with everyone.",
      });
    } catch (err: any) {
      // console.error('Story creation error:', err.message, err.stack);
      toast({
        title: "Error",
        description: err.message || "Failed to create story",
        variant: "destructive",
      });
    }
  };

  const handleEditStory = (storyId: string, updatedStory: Partial<Story>) => {
    setStories(prev =>
      prev.map(story =>
        (story._id?.toString() === storyId ? { ...story, ...updatedStory } : story)
      )
    );
  };

  const handleDeleteStory = (storyId: string) => {
    setStories(prev => prev.filter(story => story._id?.toString() !== storyId));
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
          Memories
        </h2>
        <div className="flex overflow-x-auto pb-2 space-x-4">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="relative flex-shrink-0 animate-pulse">
              <div className="w-24 h-36 rounded-3xl bg-gray-200"></div>
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
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="mb-8 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center px-2 sm:px-0">
        <Sparkles className="mr-2 h-4 w-4 text-primary/70" />
        Memories
      </h2>

      <motion.div
        className="relative overflow-visible py-4 px-2 sm:px-1"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-3xl hidden sm:block"></div>
        <div className="absolute right-12 top-10 w-32 h-32 bg-gradient-to-l from-primary/10 to-yellow-400/10 rounded-full blur-3xl hidden sm:block"></div>
        <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-300/10 rounded-full blur-3xl hidden sm:block"></div>

        <div
          className="relative z-10 flex gap-3 py-2 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isAuthenticated && (
            <div className="snap-start flex-shrink-0">
              <AddStoryButton onAddStory={handleAddStory} />
            </div>
          )}

          {sortedStories.length > 0 ? (
            sortedStories.map((story, index) => {
              const storyUserId = story.user_id?._id?.toString() || story.user_id?.id?.toString() || story.user_id?.toString();
              const isMyStory = isAuthenticated && storyUserId === userId;

              return (
                <motion.div
                  key={story._id?.toString() || `story-${index}`}
                  variants={itemVariants}
                  className="snap-start flex-shrink-0 flex flex-col items-center"
                >
                  <StoryItem
                    story={story}
                    index={index}
                    onViewStory={viewStoryHandler}
                  />
                  {isMyStory && (
                    <span className="mt-1 text-xs text-gray-600 font-medium">(You)</span>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="flex items-center justify-center min-w-[200px] py-4">
              <motion.p
                variants={itemVariants}
                className="italic text-sm text-gray-400"
              >
                No stories yet—be the first to share!
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

      {sortedStories.length > 0 && (
        <ViewStoryModal
          isOpen={isViewStoryOpen}
          onClose={() => setIsViewStoryOpen(false)}
          stories={sortedStories}
          initialStoryIndex={selectedStoryIndex}
          onEdit={handleEditStory}
          onDelete={handleDeleteStory}
        />
      )}
    </motion.div>
  );
};

export default StoriesSection;