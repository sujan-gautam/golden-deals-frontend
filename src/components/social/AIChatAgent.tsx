// src/components/social/AIChatAgent.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';

interface AIChatAgentProps {
  onSelect: () => void;
  isActive: boolean;
}

const AIChatAgent: React.FC<AIChatAgentProps> = ({ onSelect, isActive }) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-100' : ''
      }`}
      onClick={onSelect}
    >
      <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-400 to-pink-500">
        <AvatarImage src="/luna-ai-avatar.png" alt="Shree AI" />
        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
          <Sparkles className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="text-sm font-semibold truncate">Shree AI</h3>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">AI</span>
        </div>
        <p className="text-sm text-gray-500 truncate">Your AI assistant ready to chat!</p>
      </div>
    </div>
  );
};

export default AIChatAgent;