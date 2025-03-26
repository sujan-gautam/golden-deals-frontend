
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

interface AddStoryButtonProps {
  onAddStory: () => void;
}

const AddStoryButton = ({ onAddStory }: AddStoryButtonProps) => {
  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center justify-center"
      style={{ width: '80px' }}
    >
      <Button 
        onClick={onAddStory}
        variant="outline" 
        className="rounded-full w-16 h-16 p-0 relative border-2 border-primary mb-1 hover:bg-primary/10 transition-colors"
      >
        <PlusCircle className="h-6 w-6 text-primary" />
      </Button>
      <span className="text-xs">Add Story</span>
    </div>
  );
};

export default AddStoryButton;
