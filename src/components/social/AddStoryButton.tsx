
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddStoryButtonProps {
  onAddStory: () => void;
}

const AddStoryButton = ({ onAddStory }: AddStoryButtonProps) => {
  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center"
      style={{ width: '90px' }}
    >
      <motion.button 
        onClick={onAddStory}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-20 h-20 md:w-24 md:h-24 rounded-xl relative overflow-hidden shadow-md transition-all bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pattern-dots pattern-gray-400 pattern-bg-white pattern-size-2"></div>
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Plus icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary/10 rounded-full p-3 transition-all duration-300 group-hover:bg-primary/20">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
      </motion.button>
      
      <span className="mt-2 text-xs font-medium text-gray-700">Add Story</span>
    </div>
  );
};

export default AddStoryButton;
