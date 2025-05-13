import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation, Message } from '@/types/message';
import { Search, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useMessaging } from './MessagingProvider'; // Import useMessaging
import { motion, AnimatePresence } from 'framer-motion';
import { getMessages } from '@/services/api';
import AIChatAgent from './AIChatAgent';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  loading: boolean;
  onSelectAIChat: () => void;
  isAIChatActive: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  loading,
  onSelectAIChat,
  isAIChatActive,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [enhancedConversations, setEnhancedConversations] = useState<Conversation[]>([]);
  const { user } = useAuth();
  const { socket, joinConversation } = useMessaging(); // Use MessagingProvider context

  // Use VITE_IMAGE_URL consistent with SocialLayout, Profile, and MessageThread
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  // Fetch latest messages for conversations missing lastMessage and sort by updatedAt
  useEffect(() => {
    const enhanceConversations = async () => {
      const updatedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          if (!conversation.lastMessage) {
            try {
              const messages = await getMessages(conversation._id);
              const lastMessage = messages.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
              return { ...conversation, lastMessage };
            } catch (error) {
              console.error(`Failed to fetch messages for conversation ${conversation._id}:`, error);
              return conversation;
            }
          }
          return conversation;
        })
      );
      // Sort conversations by updatedAt (newest first)
      const sortedConversations = updatedConversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setEnhancedConversations(sortedConversations);
      console.log('ConversationList - Enhanced conversations:', sortedConversations);
    };

    if (conversations.length > 0 && user) {
      enhanceConversations();
    }
  }, [conversations, user]);

  // Join conversations and handle real-time message updates
  useEffect(() => {
    if (!user || !socket) return;

    // Join all conversation rooms
    enhancedConversations.forEach((conversation) => {
      console.log('ConversationList - Joining conversation:', conversation._id);
      joinConversation(conversation._id);
    });

    // Handle incoming messages
    const handleReceiveMessage = (newMessage: Message) => {
      console.log('ConversationList - Received message via Socket.IO:', newMessage);
      setEnhancedConversations((prev) => {
        const updated = prev.map((conv) =>
          conv._id === newMessage.conversationId
            ? {
                ...conv,
                lastMessage: newMessage,
                updatedAt: newMessage.createdAt || new Date().toISOString(),
              }
            : conv
        );
        // Re-sort conversations by updatedAt
        return updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [user, socket, enhancedConversations, joinConversation]);

  // Wait for user to avoid rendering issues
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Loading user...</p>
      </div>
    );
  }

  const filteredConversations = enhancedConversations.filter((conversation) =>
    conversation.participants.some((participant) =>
      participant._id !== user.id &&
      `${participant.firstname || ''} ${participant.lastname || ''}`
        .trim()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button variant="ghost" size="icon" disabled>
              <Edit className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 rounded-full bg-gray-100 border-none text-sm focus:ring-0"
              placeholder="Searching..."
              disabled
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            className="hover:bg-gray-100 rounded-full"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 rounded-full bg-gray-100 border-none text-sm focus:ring-0 focus:bg-gray-200 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* AI Chat Agent (Pinned at the top) */}
        <AIChatAgent onSelect={onSelectAIChat} isActive={isAIChatActive} />
        {filteredConversations.length === 0 && !isAIChatActive ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations found
          </div>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find((p) => p._id !== user.id);
              const displayName = otherParticipant
                ? `${otherParticipant.firstname || ''} ${otherParticipant.lastname || ''}`.trim() ||
                  otherParticipant.username ||
                  'Unknown'
                : 'Unknown';
              // Construct avatar URL consistent with SocialLayout and Profile
              const avatarSrc = otherParticipant?.avatar ? `${IMAGE_URL}${otherParticipant.avatar}` : undefined;

              // Debug participant and avatar data
              console.log('ConversationList - Conversation ID:', conversation._id);
              console.log('ConversationList - Other participant:', otherParticipant);
              console.log('ConversationList - Avatar src:', avatarSrc);

              return (
                <motion.div
                  key={conversation._id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                    activeConversationId === conversation._id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage
                      src={avatarSrc}
                      alt={displayName}
                      onError={() => console.error('ConversationList - Failed to load avatar:', avatarSrc)}
                    />
                    <AvatarFallback className="bg-gray-300 text-gray-600">
                      {displayName[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold truncate">{displayName}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {conversation.lastMessage?.createdAt
                          ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                              addSuffix: true,
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ConversationList;