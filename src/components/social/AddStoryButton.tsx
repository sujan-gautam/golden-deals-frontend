
import React from 'react';
import { PlusCircle, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddStoryButtonProps {
  onAddStory: () => void;
}

const AddStoryButton = ({ onAddStory }: AddStoryButtonProps) => {
  return (
    <motion.div 
      className="relative snap-start"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.button 
        onClick={onAddStory}
        className="relative w-28 h-40 rounded-3xl overflow-hidden shadow-lg group focus:outline-none"
        style={{ willChange: 'transform' }}
        initial={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
        whileHover={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        {/* Top border accent */}
        <div className="absolute inset-x-0 top-0 h-1.5 z-20 bg-gradient-to-r from-primary/80 via-blue-400/80 to-primary/80"></div>
        
        {/* Background pattern and gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        </div>
        
        {/* Hover effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -inset-full h-full w-1/2 z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
        
        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="relative mb-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Camera className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <motion.div 
              className="absolute -right-1 -bottom-1 bg-white rounded-full shadow-sm p-1"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                repeat: Infinity,
                repeatType: "loop",
                duration: 2,
                ease: "easeInOut" 
              }}
            >
              <PlusCircle className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
          <span className="text-sm font-medium text-gray-700 mt-2">Add Moment</span>
          <span className="text-xs text-gray-500 text-center mt-1">Share your day</span>
        </div>
      </motion.button>
      
      {/* Button label below */}
      <div className="mt-2 text-center">
        <span className="text-xs font-medium text-primary truncate block">
          Create New
        </span>
      </div>
    </motion.div>
  );
};

export default AddStoryButton;
