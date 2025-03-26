
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, X } from 'lucide-react';
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
  ]);
  
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isViewStoryOpen, setIsViewStoryOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [storyImage, setStoryImage] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleAddStory = () => {
    setIsCreateStoryOpen(true);
  };
  
  const handleStoryImageSelect = () => {
    const imageUrl = prompt('Enter an image URL for your story:');
    if (imageUrl) {
      setStoryImage(imageUrl);
    }
  };
  
  const handleCreateStory = () => {
    if (!storyImage) return;
    
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
    setIsCreateStoryOpen(false);
  };
  
  const viewStory = (story: Story) => {
    setCurrentStory(story);
    setIsViewStoryOpen(true);
    
    // Auto-close story after 5 seconds
    setTimeout(() => {
      setIsViewStoryOpen(false);
    }, 5000);
  };
  
  return (
    <div className="mb-6">
      <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
        <div 
          className="flex-shrink-0 flex flex-col items-center justify-center"
          style={{ width: '80px' }}
        >
          <Button 
            onClick={handleAddStory}
            variant="outline" 
            className="rounded-full w-16 h-16 p-0 relative border-2 border-primary mb-1"
          >
            <PlusCircle className="h-6 w-6 text-primary" />
          </Button>
          <span className="text-xs">Add Story</span>
        </div>
        
        {stories.map(story => (
          <div 
            key={story.id} 
            className="flex-shrink-0 flex flex-col items-center"
            style={{ width: '80px' }}
          >
            <button 
              onClick={() => viewStory(story)}
              className="rounded-full w-16 h-16 p-0 relative border-2 border-primary overflow-hidden mb-1"
            >
              <div className="absolute inset-0">
                <img 
                  src={story.image} 
                  alt="Story" 
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
            <span className="text-xs truncate w-full text-center">{story.user.name.split(' ')[0]}</span>
          </div>
        ))}
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
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <Button onClick={handleStoryImageSelect} variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Photo
                </Button>
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
            <div className="relative h-[70vh]">
              <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentStory.user.avatar} alt={currentStory.user.name} />
                  <AvatarFallback>{currentStory.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{currentStory.user.name}</span>
              </div>
              
              <img 
                src={currentStory.image} 
                alt="Story" 
                className="absolute inset-0 w-full h-full object-contain"
              />
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full text-white"
                onClick={() => setIsViewStoryOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StoriesSection;
