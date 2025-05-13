import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation, Message } from '@/types/message';
import { ChevronLeft, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMessaging } from './MessagingProvider';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string, conversationId: string) => Promise<void>;
  onBack: () => void;
  isMobile: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  onSendMessage,
  onBack,
  isMobile,
}) => {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const { user } = useAuth();
  const { socket, joinConversation } = useMessaging();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  // Sync messages and join conversation
  useEffect(() => {
    setLocalMessages(messages);
    if (conversation?._id) {
      joinConversation(conversation._id);
    }
  }, [conversation?._id, messages, joinConversation]);

  // Handle scroll behavior
  useEffect(() => {
    const scrollToBottom = () => {
      if (!isUserScrolling.current && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    scrollToBottom();
  }, [localMessages]);

  // Track user scrolling to prevent auto-scroll when user is reading
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        // Consider user scrolling if not near the bottom
        isUserScrolling.current = scrollTop + clientHeight < scrollHeight - 50;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // WebSocket for real-time messages
  useEffect(() => {
    if (!conversation?._id || !socket) return;

    const handleReceiveMessage = (newMessage: Message) => {
      if (newMessage.conversationId === conversation._id) {
        setLocalMessages((prev) => {
          const tempIndex = prev.findIndex(
            (msg) =>
              msg._id.startsWith('temp-') &&
              msg.content === newMessage.content &&
              (msg.sender?._id === newMessage.sender?._id ||
               msg.sender?._id === newMessage.senderId ||
               msg.sender?._id === newMessage.receiver)
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMessage;
            return updated;
          }
          if (!prev.some((msg) => msg._id === newMessage._id)) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [conversation?._id, socket]);

  const handleSend = async () => {
    if (!input.trim() || !conversation?._id || !user) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      conversationId: conversation._id,
      sender: { _id: user.id, username: user.username || '', avatar: user.avatar || '' },
      content: input,
      createdAt: new Date().toISOString(),
      product: null,
    };

    setLocalMessages((prev) => [...prev, tempMessage]);
    setInput('');
    isUserScrolling.current = false; // Ensure scroll to bottom on new message

    try {
      await onSendMessage(input, conversation._id);
    } catch (error) {
      console.error('Failed to send message:', error);
      setLocalMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  if (!user || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>{!user ? 'Loading user...' : 'Select a conversation'}</p>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find((p) => p._id !== user.id);
  const displayName = otherParticipant
    ? `${otherParticipant.firstname || ''} ${otherParticipant.lastname || ''}`.trim() || otherParticipant.username || 'Unknown'
    : 'Unknown';
  const headerAvatarSrc = otherParticipant?.avatar ? `${IMAGE_URL}${otherParticipant.avatar}` : undefined;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed Header */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm p-3 flex items-center">
        {isMobile && (
          <Link to="/messages" onClick={onBack}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src={headerAvatarSrc} alt={displayName} />
          <AvatarFallback className="bg-gray-300 text-gray-600">{displayName[0] || 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-base font-semibold truncate">{displayName}</h2>
      </header>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .scrollbar-hidden::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {localMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No messages yet</div>
        ) : (
          <AnimatePresence>
            {localMessages
              .filter((message) => {
                const isValid =
                  (message.sender && message.sender._id) ||
                  message.senderId ||
                  (message.receiver && user && message.receiver !== user.id) ||
                  (user && conversation?.participants.some((p) => p._id === user.id));
                return isValid;
              })
              .map((message) => {
                const senderId =
                  message.sender?._id ||
                  message.senderId ||
                  (message.receiver && user && message.receiver !== user.id ? message.receiver : user.id);
                const isSentByUser = senderId?.toString() === user.id.toString();
                const senderUser = isSentByUser
                  ? { _id: user.id, username: user.username || '', avatar: user.avatar || '' }
                  : otherParticipant || { _id: senderId, username: 'Unknown', avatar: '' };
                const messageAvatarSrc = senderUser.avatar ? `${IMAGE_URL}${senderUser.avatar}` : undefined;

                return (
                  <motion.div
                    key={message._id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-end gap-2 mb-4 ${
                      isSentByUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isSentByUser && (
                      <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                        <AvatarImage src={messageAvatarSrc} alt={senderUser.username || displayName} />
                        <AvatarFallback className="bg-gray-300 text-gray-600">
                          {(senderUser.username || displayName)[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                        isSentByUser
                          ? 'bg-yellow-500 text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {message.product && (
                        <div className="mb-2 p-2 bg-white text-gray-800 rounded-lg shadow-inner">
                          {message.product.image && (
                            <img
                              src={message.product.image}
                              alt={message.product.title}
                              className="w-full h-24 object-cover rounded-md mb-2"
                            />
                          )}
                          <h3 className="text-sm font-semibold">
                            <Link
                              to={`/products/${message.product._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {message.product.title}
                            </Link>
                          </h3>
                          {message.product.price !== null && (
                            <p className="text-xs flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {message.product.price}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.product.condition && (
                              <Badge variant="secondary" className="text-xs">
                                <Info className="h-3 w-3 mr-1" />
                                {message.product.condition}
                              </Badge>
                            )}
                            {message.product.category && (
                              <Badge variant="outline" className="text-xs">
                                {message.product.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span
                        className={`text-xs block mt-1 ${
                          isSentByUser ? 'text-yellow-100' : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(message.createdAt), 'p')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <footer className="sticky bottom-0 z-10 bg-white border-t p-3">
        <div className="flex items-center">
          <Input
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 mr-2 rounded-full border-gray-300 text-sm py-2 px-4 focus:ring-0 focus:border-gray-400"
            autoComplete="off"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full h-9 w-9 p-0 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default MessageThread;