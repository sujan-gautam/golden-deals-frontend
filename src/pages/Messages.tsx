
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import SocialLayout from '@/components/layout/SocialLayout';
import ConversationList from '@/components/social/ConversationList';
import MessageThread from '@/components/social/MessageThread';
import NewConversationModal from '@/components/social/NewConversationModal';
import { Conversation, Message } from '@/types/message';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getConversations, getMessages, sendMessage, createConversation } from '@/services/api';

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load conversations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    if (activeConversationId) {
      const fetchMessages = async () => {
        setIsMessagesLoading(true);
        try {
          // Mark conversations as read
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv._id?.toString() === activeConversationId ? { ...conv, unreadCount: 0 } : conv
            )
          );
          
          // Load messages for active conversation
          const messages = await getMessages(activeConversationId);
          setActiveMessages(messages);
          
          // On mobile, hide conversation list
          if (isMobile) {
            setShowConversationList(false);
          }
        } catch (err: any) {
          toast({
            title: "Error",
            description: err.message || "Failed to load messages",
            variant: "destructive",
          });
        } finally {
          setIsMessagesLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [activeConversationId, isMobile, toast]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversationId(conversation._id?.toString() || null);
  };

  const handleNewConversation = () => {
    setIsNewConversationModalOpen(true);
  };

  const handleStartNewConversation = async (userId: string) => {
    // Find if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.some(p => p._id === userId)
    );

    if (existingConversation) {
      setActiveConversationId(existingConversation._id?.toString() || null);
      toast({
        title: "Conversation exists",
        description: `You already have a conversation with this user.`,
      });
      return;
    }

    try {
      const newConversation = await createConversation(userId);
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation._id?.toString() || null);
      setActiveMessages([]);
      setIsNewConversationModalOpen(false);
      
      toast({
        title: "Conversation started",
        description: `You can now start messaging.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId || !user) return;

    try {
      const newMessage = await sendMessage(activeConversationId, content);
      
      // Update messages
      setActiveMessages(prev => [...prev, newMessage]);
      
      // Update conversation's last message
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id?.toString() === activeConversationId 
            ? { 
                ...conv, 
                lastMessage: {
                  content,
                  createdAt: new Date().toISOString(),
                  senderId: user._id as string
                }
              } 
            : conv
        )
      );
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  return (
    <SocialLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="flex h-[calc(100vh-8rem)]">
          {(showConversationList || !isMobile) && (
            <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r'}`}>
              <ConversationList 
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                loading={isLoading}
              />
            </div>
          )}
          
          {(!showConversationList || !isMobile) && (
            <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
              <MessageThread 
                conversation={conversations.find(c => c._id?.toString() === activeConversationId) || null}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                onBack={handleBackToList}
                isMobile={isMobile}
                loading={isMessagesLoading}
              />
            </div>
          )}
        </div>
      </div>

      <NewConversationModal 
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onStartConversation={handleStartNewConversation}
      />
    </SocialLayout>
  );
};

export default Messages;
