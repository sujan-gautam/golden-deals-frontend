
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMobile } from '@/hooks/use-mobile';
import SocialLayout from '@/components/layout/SocialLayout';
import ConversationList from '@/components/social/ConversationList';
import MessageThread from '@/components/social/MessageThread';
import NewConversationModal from '@/components/social/NewConversationModal';
import { Conversation, Message } from '@/types/message';
import { useToast } from '@/components/ui/use-toast';

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: '1', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: '2', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' }
    ],
    lastMessage: {
      content: 'Hey, are you coming to the event tomorrow?',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      senderId: '2'
    },
    unreadCount: 1
  },
  {
    id: 'conv-2',
    participants: [
      { id: '1', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: '3', name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' }
    ],
    lastMessage: {
      content: 'Thanks for the information!',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      senderId: '1'
    },
    unreadCount: 0
  },
  {
    id: 'conv-3',
    participants: [
      { id: '1', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: '4', name: 'Emily Williams', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' }
    ],
    lastMessage: {
      content: 'I\'ll message you more details about the item soon',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      senderId: '4'
    },
    unreadCount: 0
  }
];

// Mock messages for each conversation
const mockMessages: { [key: string]: Message[] } = {
  'conv-1': [
    {
      id: 'm1',
      senderId: '1',
      receiverId: '2',
      content: 'Hey Sarah, how are you doing?',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm2',
      senderId: '2',
      receiverId: '1',
      content: 'Hi John! I\'m doing great, thanks for asking. How about you?',
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm3',
      senderId: '1',
      receiverId: '2',
      content: 'I\'m good too! Just working on some projects.',
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm4',
      senderId: '2',
      receiverId: '1',
      content: 'That sounds interesting. What kind of projects?',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm5',
      senderId: '1',
      receiverId: '2',
      content: 'Mostly web development stuff. I\'m learning React and building some cool applications.',
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm6',
      senderId: '2',
      receiverId: '1',
      content: 'Nice! I love React. Are you attending any events or meetups?',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm7',
      senderId: '1',
      receiverId: '2',
      content: 'Not yet, but I should look into that.',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm8',
      senderId: '2',
      receiverId: '1',
      content: 'Hey, are you coming to the event tomorrow?',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false
    }
  ],
  'conv-2': [
    {
      id: 'm1',
      senderId: '3',
      receiverId: '1',
      content: 'Hi John, I wanted to ask about the marketplace listing you posted.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm2',
      senderId: '1',
      receiverId: '3',
      content: 'Hey Michael! Sure, what would you like to know?',
      createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm3',
      senderId: '3',
      receiverId: '1',
      content: 'Is the item still available? And what condition is it in?',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm4',
      senderId: '1',
      receiverId: '3',
      content: 'Yes, it\'s still available! It\'s in great condition, only used a few times.',
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm5',
      senderId: '3',
      receiverId: '1',
      content: 'That sounds great. Would you be willing to meet on campus for the exchange?',
      createdAt: new Date(Date.now() - 3.2 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm6',
      senderId: '1',
      receiverId: '3',
      content: 'Absolutely! I\'m usually around the student center on weekdays between classes.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm7',
      senderId: '3',
      receiverId: '1',
      content: 'Perfect. I\'ll be there tomorrow around 2pm. Does that work for you?',
      createdAt: new Date(Date.now() - 3.1 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm8',
      senderId: '1',
      receiverId: '3',
      content: 'Thanks for the information!',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ],
  'conv-3': [
    {
      id: 'm1',
      senderId: '4',
      receiverId: '1',
      content: 'Hello John, I saw your post about selling textbooks. Do you still have the Biology 101 book?',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm2',
      senderId: '1',
      receiverId: '4',
      content: 'Hi Emily! Yes, I still have it. It\'s the 10th edition, right?',
      createdAt: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm3',
      senderId: '4',
      receiverId: '1',
      content: 'That\'s the one! How much are you asking for it?',
      createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm4',
      senderId: '1',
      receiverId: '4',
      content: 'I was thinking $45. It\'s in really good condition, no highlighting or notes.',
      createdAt: new Date(Date.now() - 1.7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm5',
      senderId: '4',
      receiverId: '1',
      content: 'That sounds fair. Would you be able to meet at the library tomorrow?',
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm6',
      senderId: '1',
      receiverId: '4',
      content: 'Tomorrow is a bit tight for me. How about the day after?',
      createdAt: new Date(Date.now() - 1.4 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 'm7',
      senderId: '4',
      receiverId: '1',
      content: 'That works for me too. I\'ll message you more details about the item soon',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ]
};

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const isMobile = useMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/signin');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeConversationId) {
      // Mark messages as read
      if (conversations.find(c => c.id === activeConversationId)?.unreadCount) {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === activeConversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
      
      // Load messages for active conversation
      setActiveMessages(mockMessages[activeConversationId] || []);
      
      // On mobile, hide conversation list
      if (isMobile) {
        setShowConversationList(false);
      }
    }
  }, [activeConversationId, isMobile, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
  };

  const handleNewConversation = () => {
    setIsNewConversationModalOpen(true);
  };

  const handleStartNewConversation = (userId: string) => {
    // Find if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.some(p => p.id === userId)
    );

    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      toast({
        title: "Conversation exists",
        description: `You already have a conversation with this user.`,
      });
      return;
    }

    // Find user
    const mockUsers = [
      { id: '2', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
      { id: '3', name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
      { id: '4', name: 'Emily Williams', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
      { id: '5', name: 'James Miller', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
      { id: '6', name: 'Olivia Davis', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
      { id: '7', name: 'Noah Wilson', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
      { id: '8', name: 'Sophia Taylor', avatar: 'https://randomuser.me/api/portraits/women/8.jpg' },
    ];
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) return;

    // Create new conversation
    const newConversationId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      id: newConversationId,
      participants: [
        { id: '1', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
        user
      ],
      lastMessage: {
        content: 'Start a new conversation',
        createdAt: new Date().toISOString(),
        senderId: '1'
      },
      unreadCount: 0
    };

    // Add empty messages array for this conversation
    mockMessages[newConversationId] = [];

    // Update state
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);
    setActiveMessages([]);

    toast({
      title: "Conversation started",
      description: `You can now message ${user.name}.`,
    });
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversationId) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: '1',
      receiverId: conversations.find(c => c.id === activeConversationId)?.participants.find(p => p.id !== '1')?.id || '',
      content,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Update messages
    setActiveMessages(prev => [...prev, newMessage]);
    
    // Update conversation's last message
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === activeConversationId 
          ? { 
              ...conv, 
              lastMessage: {
                content,
                createdAt: new Date().toISOString(),
                senderId: '1'
              }
            } 
          : conv
      )
    );

    // For demo, simulate a reply after a delay
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const otherUser = conversations.find(c => c.id === activeConversationId)?.participants.find(p => p.id !== '1');
        if (!otherUser) return;

        const replyContent = [
          "Thanks for your message!",
          "I'll get back to you soon.",
          "That sounds great!",
          "Yes, I'm still interested.",
          "Can we meet tomorrow?",
          "I appreciate your help!",
          "Let me think about it.",
          "Perfect, thanks!"
        ][Math.floor(Math.random() * 8)];

        const replyMessage: Message = {
          id: `m${Date.now()}`,
          senderId: otherUser.id,
          receiverId: '1',
          content: replyContent,
          createdAt: new Date().toISOString(),
          read: true
        };

        setActiveMessages(prev => [...prev, replyMessage]);
        
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === activeConversationId 
              ? { 
                  ...conv, 
                  lastMessage: {
                    content: replyContent,
                    createdAt: new Date().toISOString(),
                    senderId: otherUser.id
                  }
                } 
              : conv
          )
        );

      }, Math.random() * 5000 + 1000);
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
              />
            </div>
          )}
          
          {(!showConversationList || !isMobile) && (
            <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
              <MessageThread 
                conversation={conversations.find(c => c.id === activeConversationId) || null}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                onBack={handleBackToList}
                isMobile={isMobile}
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
