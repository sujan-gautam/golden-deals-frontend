import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import SocialLayout from '@/components/layout/SocialLayout';
import ConversationList from '@/components/social/ConversationList';
import MessageThread from '@/components/social/MessageThread';
import AIMessageThread from '@/components/social/AIMessageThread';
import NewConversationModal from '@/components/social/NewConversationModal';
import { Conversation, Message } from '@/types/message';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getConversations, getMessages, createConversation, sendMessage } from '@/services/api';
import { MessagingProvider, useMessaging } from '@/components/social/MessagingProvider';

const MessagesInner: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isAIChatActive, setIsAIChatActive] = useState(false);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { socket, joinConversation } = useMessaging();

  // Sync state with URL
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
      setIsAIChatActive(false);
      if (isMobile) setShowConversationList(false);
    } else if (!conversationId) {
      // Reset state when navigating to /messages
      setActiveConversationId(null);
      setActiveMessages([]);
      setIsAIChatActive(false);
      setShowConversationList(true);
    }
  }, [conversationId, isMobile, activeConversationId]);

  // Handle authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Session Expired',
        description: 'Please sign in to continue.',
        variant: 'destructive',
      });
      navigate('/signin');
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err: any) {
        toast({
          title: 'Error',
          description:
            err.message === 'Unauthorized: No user found'
              ? 'Session expired. Please sign in again.'
              : err.message || 'Failed to load conversations',
          variant: 'destructive',
        });
        if (err.message === 'Unauthorized: No user found') {
          navigate('/signin');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchConversations();
    }
  }, [authLoading, isAuthenticated, toast, navigate]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId || !isAuthenticated || isAIChatActive) return;

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        joinConversation(activeConversationId);
        const messages = await getMessages(activeConversationId);
        setActiveMessages(messages);
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === activeConversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
        if (isMobile) setShowConversationList(false);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setIsMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [activeConversationId, isMobile, toast, joinConversation, isAuthenticated, isAIChatActive]);

  // Handle real-time messages
  useEffect(() => {
    if (!socket || !user || !isAuthenticated) return;

    socket.on('receive_message', (newMessage: Message) => {
      console.log('MessagesInner: Received real-time message:', newMessage);
      if (newMessage.conversationId === activeConversationId) {
        setActiveMessages((prev) => {
          const tempIndex = prev.findIndex(
            (msg) =>
              msg._id.startsWith('temp-') &&
              msg.content === newMessage.content &&
              msg.sender?._id === newMessage.sender?._id
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMessage;
            return updated;
          }
          return [...prev, newMessage];
        });
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === newMessage.conversationId
            ? {
                ...conv,
                lastMessage: {
                  _id: newMessage._id,
                  content: newMessage.content,
                  createdAt: newMessage.createdAt,
                  senderId: newMessage.sender._id,
                },
                unreadCount:
                  newMessage.sender._id !== user._id && conv._id !== activeConversationId
                    ? (conv.unreadCount || 0) + 1
                    : conv.unreadCount,
              }
            : conv
        )
      );
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket, activeConversationId, user, isAuthenticated]);

  const handleSelectConversation = (conversation: Conversation) => {
    setIsAIChatActive(false);
    setActiveConversationId(conversation._id);
    navigate(`/messages/${conversation._id}`);
  };

  const handleSelectAIChat = () => {
    setIsAIChatActive(true);
    setActiveConversationId(null);
    setActiveMessages([]);
    if (isMobile) setShowConversationList(false);
    navigate('/messages');
  };

  const handleNewConversation = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please sign in to start a new conversation.',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }
    setIsNewConversationModalOpen(true);
  };

  const handleStartNewConversation = async (userId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please sign in to start a conversation.',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }

    try {
      const existingConversation = conversations.find((conv) =>
        conv.participants.some((p) => p._id === userId)
      );
      if (existingConversation) {
        setActiveConversationId(existingConversation._id);
        setIsAIChatActive(false);
        setIsNewConversationModalOpen(false);
        navigate(`/messages/${existingConversation._id}`);
        return;
      }

      const newConversation = await createConversation(userId);
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(newConversation._id);
      setIsAIChatActive(false);
      setActiveMessages([]);
      setIsNewConversationModalOpen(false);
      toast({ title: 'Success', description: 'Conversation started' });
      navigate(`/messages/${newConversation._id}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (content: string, conversationId: string, isAIResponse = false) => {
    if (!user || !isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please sign in to send a message.',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }

    const newMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversationId: isAIChatActive ? 'ai-chat' : conversationId,
      sender: isAIResponse
        ? { _id: 'ai-agent', username: 'Luna AI', avatar: '/luna-ai-avatar.png' }
        : user,
      receiver: isAIResponse ? user : { _id: 'ai-agent', username: 'Luna AI', avatar: '/luna-ai-avatar.png' },
      content,
      createdAt: new Date().toISOString(),
      isAIResponse,
    };

    if (isAIChatActive) {
      setActiveMessages((prev) => [...prev, newMessage]);
      return;
    }

    if (!conversationId) {
      toast({
        title: 'Error',
        description: 'No conversation selected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('MessagesInner: Sending message:', { conversationId, content });
      await sendMessage({ conversationId, content, product: null });
      console.log('MessagesInner: Message sent successfully');
      const updatedMessages = await getMessages(conversationId);
      setActiveMessages(updatedMessages);
    } catch (error) {
      console.error('MessagesInner: Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleBackToList = () => {
    setActiveConversationId(null); // Clear active conversation
    setActiveMessages([]); // Clear messages
    setShowConversationList(true);
    setIsAIChatActive(false);
    navigate('/messages');
  };

  return (
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
              onSelectAIChat={handleSelectAIChat}
              isAIChatActive={isAIChatActive}
            />
          </div>
        )}
        {(!showConversationList || !isMobile) && !isAIChatActive && activeConversationId && (
          <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
            <MessageThread
              conversation={conversations.find((c) => c._id === activeConversationId) || null}
              messages={activeMessages}
              onSendMessage={handleSendMessage}
              onBack={handleBackToList}
              isMobile={isMobile}
            />
          </div>
        )}
        {(!showConversationList || !isMobile) && isAIChatActive && (
          <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
            <AIMessageThread
              messages={activeMessages}
              onSendMessage={(content, isAIResponse) => handleSendMessage(content, 'ai-chat', isAIResponse)}
              onBack={handleBackToList}
              isMobile={isMobile}
              loading={isMessagesLoading}
            />
          </div>
        )}
      </div>
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onStartConversation={handleStartNewConversation}
      />
    </div>
  );
};

const Messages: React.FC = () => (
  <MessagingProvider>
    <SocialLayout>
      <MessagesInner />
    </SocialLayout>
  </MessagingProvider>
);

export default Messages;