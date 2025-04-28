import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Story } from '@/types/story';
import { viewStory, editStory, deleteStory } from '@/services/api';
import { formatDistance } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/components/ui/use-toast";

interface ViewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex: number;
  onDelete: (storyId: string) => void;
}

const BASE_URL = import.meta.env.VITE_IMAGE_URL || (import.meta.env.MODE === 'production' 
  ? '' 
  : 'http://localhost:5000');

const ViewStoryModal: React.FC<ViewStoryModalProps> = ({
  isOpen,
  onClose,
  stories = [],
  initialStoryIndex = 0,
  onDelete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedStories, setEditedStories] = useState<Story[]>(stories);
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?._id?.toString() || user?.id?.toString() || "";

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialStoryIndex);
      setProgress(0);
      setHasViewed(false);
      setEditedStories([...stories]);
    }
  }, [isOpen, initialStoryIndex, stories]);

  useEffect(() => {
    if (!isOpen || !editedStories.length) return;

    const currentStory = editedStories[currentIndex];
    if (!currentStory) return;

    const markAsViewed = async () => {
      if (hasViewed) return;
      try {
        const storyId = currentStory._id?.toString();
        if (storyId) {
          await viewStory(storyId);
          setHasViewed(true);
        }
      } catch (error) {
        setHasViewed(true);
      }
    };
    markAsViewed();

    setProgress(0);
    const storyDuration = 5000;
    const interval = 100;
    const step = (interval / storyDuration) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          const newProgress = prev + step;
          if (newProgress >= 100) {
            setTimeout(() => {
              if (currentIndex < editedStories.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setHasViewed(false);
              } else {
                onClose();
              }
            }, 0);
            return 0;
          }
          return newProgress;
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, isPaused, editedStories.length, onClose]);

  useEffect(() => {
    setIsPaused(isEditModalOpen);
  }, [isEditModalOpen]);

  if (!isOpen || !editedStories.length) return null;

  const currentStory = editedStories[currentIndex];
  const isMyStory = userId && (currentStory.user_id?._id?.toString() || currentStory.user_id?.id?.toString() || currentStory.user_id?.toString()) === userId;

  const handleNext = () => {
    if (currentIndex < editedStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setHasViewed(false);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setHasViewed(false);
    }
  };

  const handleEditSubmit = async (newText: string) => {
    if (!isMyStory || !currentStory._id) return;
  
    try {
      const updatedStory: Partial<Story> = { text: newText };
      const editedStoryResponse = await editStory(currentStory._id.toString(), updatedStory);
  
      setEditedStories(prevStories => {
        const updatedStories = prevStories.map(story =>
          story._id === currentStory._id
            ? { ...story, text: editedStoryResponse.text || newText }
            : story
        );
        return [...updatedStories];
      });
  
      setIsEditModalOpen(false);
      setIsPaused(false);
      toast({
        title: "Story updated!",
        description: "Your story has been edited.",
      });
    } catch (error: any) {
      console.error('Failed to edit story:', error);
      setIsPaused(false);
      toast({
        title: "Error",
        description: error.message || "Failed to edit story",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isMyStory || !currentStory._id) return;

    try {
      await deleteStory(currentStory._id.toString());
      onDelete(currentStory._id.toString());
      setEditedStories(prevStories =>
        prevStories.filter(story => story._id !== currentStory._id)
      );
      setIsDeleteModalOpen(false);
      toast({
        title: "Story deleted!",
        description: "Your story has been removed.",
      });
      if (editedStories.length === 1) {
        onClose();
      } else if (currentIndex === editedStories.length - 1) {
        setCurrentIndex(prev => prev - 1);
      }
    } catch (error: any) {
      console.error('Failed to delete story:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete story",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    try {
      return formatDistance(new Date(date), new Date(), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  const getImagePath = (image: Story['image']): string => {
    if (!image) return `${BASE_URL}/fallback-image.jpg`;
    const path = typeof image === 'string' ? image : image.path;
    return path?.startsWith('http') ? path : `${BASE_URL}${path || '/fallback-image.jpg'}`;
  };

  const getAvatarPath = (avatar: string | undefined | null): string => {
    if (!avatar) return `${BASE_URL}/default-avatar.jpg`;
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  const getUsername = (user: Story['user_id']) => {
    return user?.username || user?.name || 'Unknown';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `${BASE_URL}/fallback-image.jpg`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/90 via-black/80 to-black/90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md h-[85vh] max-h-[900px] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-1.5 bg-gray-800/70 rounded-full text-white hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close story"
            >
              <X className="h-5 w-5" />
            </button>

            {/* More Options (for user's own stories) */}
            {isMyStory && (
              <div className="absolute top-4 right-14 z-20">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 bg-gray-800/70 rounded-full text-white hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="More options"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-lg p-2 w-32"
                  >
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded-md"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Progress Bars */}
            <div className="absolute top-2 left-2 right-2 z-10 flex space-x-1">
              {editedStories.map((story, index) => (
                <div
                  key={story._id?.toString() || index}
                  className="flex-1 h-1 bg-gray-600/50 rounded-full overflow-hidden"
                >
                  <Progress
                    value={index === currentIndex ? progress : index < currentIndex ? 100 : 0}
                    className="h-full bg-white transition-all duration-100 ease-linear"
                  />
                </div>
              ))}
            </div>

            {/* Header with User Info and Text */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                  <AvatarImage src={getAvatarPath(currentStory.user_id?.avatar)} />
                  <AvatarFallback>
                    {getUsername(currentStory.user_id)?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <div className="font-semibold text-sm">{getUsername(currentStory.user_id)}</div>
                  <div className="text-xs opacity-70">{formatTimeAgo(currentStory.createdAt)}</div>
                </div>
              </div>
              {currentStory.text && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-center"
                  style={{ color: currentStory.textColor || '#ffffff' }}
                >
                  <span className="text-lg font-medium drop-shadow-md">{currentStory.text}</span>
                </motion.div>
              )}
            </div>

            {/* Image Container */}
            <div
              className="h-full w-full relative"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              <img
                src={getImagePath(currentStory.image)}
                alt={`${getUsername(currentStory.user_id)}'s story`}
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Navigation Buttons */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-gray-800/50 rounded-full text-white hover:bg-gray-800/70 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Previous story"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {currentIndex < editedStories.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-gray-800/50 rounded-full text-white hover:bg-gray-800/70 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Next story"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
              <EditStoryModal
                initialText={currentStory.text || ""}
                onSubmit={handleEditSubmit}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setIsPaused(false);
                }}
              />
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
              <DeleteStoryModal
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Edit Story Modal Component
interface EditStoryModalProps {
  initialText: string;
  onSubmit: (newText: string) => void;
  onClose: () => void;
}

const EditStoryModal: React.FC<EditStoryModalProps> = ({ initialText, onSubmit, onClose }) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Edit Story</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter your story text..."
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Delete Story Modal Component
interface DeleteStoryModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteStoryModal: React.FC<DeleteStoryModalProps> = ({ onConfirm, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Delete Story</h3>
        <p className="text-gray-600 mb-4">Are you sure you want to delete this story? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewStoryModal;