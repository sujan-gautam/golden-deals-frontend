
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/types/message";
import { Search, Edit, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  loading: boolean;
}

const ConversationList = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation, 
  onNewConversation,
  loading
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.participants.some(participant => 
      participant._id !== user?._id && participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-start">
              <div className="h-12 w-12 mr-3 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-12 w-12 mr-3 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button variant="ghost" size="icon" onClick={onNewConversation}>
            <Edit className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-gray-500">
          <Users className="h-12 w-12 mb-4 text-gray-400" />
          {searchQuery ? (
            <p>No conversations found matching "{searchQuery}"</p>
          ) : (
            <>
              <p className="mb-4">No conversations yet</p>
              <Button onClick={onNewConversation} className="mt-2">
                <Edit className="h-4 w-4 mr-2" />
                Start a new conversation
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
            
            return (
              <button
                key={conversation._id?.toString()}
                className={`flex items-start p-4 w-full text-left hover:bg-gray-100 transition-colors ${
                  activeConversationId === conversation._id?.toString() ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name || 'User'} />
                  <AvatarFallback>{otherParticipant?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium truncate">{otherParticipant?.name}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage.senderId === user?._id ? 'You: ' : ''}
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-usm-gold text-white mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
