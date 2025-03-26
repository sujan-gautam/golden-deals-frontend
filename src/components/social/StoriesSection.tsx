
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, X, Camera, Upload, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  image: string;
  createdAt: string;
}

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
  const [storyImage, setStoryImage] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyTextColor, setStoryTextColor] = useState('#ffffff');
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleAddStory = () => {
    setIsCreateStoryOpen(true);
    setStoryImage('');
    setStoryText('');
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server and get a URL
      // For demo, we'll just use a sample image URL
      setStoryImage('https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=2070&auto=format&fit=crop');
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded.",
      });
    }
  };
  
  const handleStoryImageSelect = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCreateStory = () => {
    if (!storyImage) {
      toast({
        title: "Image required",
        description: "Please add an image to your story.",
        variant: "destructive"
      });
      return;
    }
    
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
    setStoryImage('');
    setStoryText('');
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
        <div 
          className="flex-shrink-0 flex flex-col items-center justify-center"
          style={{ width: '80px' }}
        >
          <Button 
            onClick={handleAddStory}
            variant="outline" 
            className="rounded-full w-16 h-16 p-0 relative border-2 border-primary mb-1 hover:bg-primary/10 transition-colors"
          >
            <PlusCircle className="h-6 w-6 text-primary" />
          </Button>
          <span className="text-xs">Add Story</span>
        </div>
        
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            className="flex-shrink-0 flex flex-col items-center"
            style={{ width: '80px' }}
          >
            <button 
              onClick={() => viewStory(story, index)}
              className="group rounded-full w-16 h-16 p-0 relative border-2 border-primary overflow-hidden mb-1"
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
        ))}
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
      
      {/* Create Story Dialog */}
      <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {storyImage ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <img src={storyImage} alt="Story" className="w-full h-full object-cover" />
                
                {storyText && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <h3 
                      className="text-2xl font-bold text-center break-words" 
                      style={{ color: storyTextColor }}
                    >
                      {storyText}
                    </h3>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  onClick={() => setStoryImage('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 gap-4">
                <Button onClick={handleStoryImageSelect} variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
                <Button onClick={handleStoryImageSelect} variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload from Device
                </Button>
              </div>
            )}
            
            {storyImage && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Add text to your story..."
                    className="flex-1 p-2 text-sm border rounded-md"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Text Color:</span>
                  <div className="flex gap-2">
                    {['#ffffff', '#000000', '#FF5757', '#47A992', '#FF9843', '#4D77FF'].map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full ${storyTextColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setStoryTextColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateStoryOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateStory} disabled={!storyImage}>
              Share to Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Story Dialog */}
      {currentStory && (
        <Dialog open={isViewStoryOpen} onOpenChange={setIsViewStoryOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStory.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative h-[70vh]"
              >
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
                  {stories.map((story, i) => (
                    <div 
                      key={story.id}
                      className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden"
                    >
                      {i === currentStoryIndex && (
                        <motion.div 
                          className="h-full bg-white"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, ease: "linear" }}
                        />
                      )}
                      {i < currentStoryIndex && (
                        <div className="h-full bg-white w-full" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center space-x-2 pt-6">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={currentStory.user.avatar} alt={currentStory.user.name} />
                    <AvatarFallback>{currentStory.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">{currentStory.user.name}</span>
                </div>
                
                <img 
                  src={currentStory.image} 
                  alt="Story" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full text-white"
                  onClick={() => setIsViewStoryOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {/* Navigation buttons */}
                <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start" onClick={handlePrevStory}>
                  {currentStoryIndex > 0 && (
                    <div className="h-full cursor-pointer" />
                  )}
                </div>
                <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end" onClick={handleNextStory}>
                  <div className="h-full cursor-pointer" />
                </div>
              </motion.div>
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StoriesSection;
