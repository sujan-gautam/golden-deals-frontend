import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { AIMessage, Message } from '@/types/message';
import { generateAIResponse } from '@/services/aiChatService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

// Keyframe animation for the gradient background
const gradientKeyframes = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

interface AIMessageThreadProps {
  messages: Message[];
  onSendMessage: (content: string, isAIResponse?: boolean) => void;
  onBack: () => void;
  isMobile: boolean;
  loading?: boolean;
}

const presetMessages = [
  'Hey',
  'How are you?',
  "What's the weather like today?",
  'Tell me a joke',
  'What can you help me with?',
];

const AIMessageThread: React.FC<AIMessageThreadProps> = ({
  messages,
  onSendMessage,
  onBack,
  isMobile,
  loading,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasFocusedRef = useRef<boolean>(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Placeholder for checking if the user is the creator of Shree AI
  const SHREE_AI_CREATOR_ID = 'sujan-gautam-id';
  const isOwnAI = user && user.id === SHREE_AI_CREATOR_ID;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleFocus = () => {
      wasFocusedRef.current = true;
    };
    const handleBlur = () => {
      if (isTyping) {
        setTimeout(() => {
          if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      } else {
        wasFocusedRef.current = false;
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, [isTyping]);

  useEffect(() => {
    if (!newMessage && wasFocusedRef.current && inputRef.current && !isTyping && !authLoading) {
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [newMessage, messages, isTyping, authLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug messages to inspect sender, senderId, and isAIResponse
  useEffect(() => {
    console.log('Messages:', messages.map(msg => ({
      content: msg.content,
      sender: msg.sender,
      senderId: msg.senderId,
      isAIResponse: msg.isAIResponse,
    })));
    console.log('User ID:', user?.id); // Debug user.id
  }, [messages, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    if (authLoading) {
      toast({
        title: 'Error',
        description: 'Authentication is still loading. Please wait.',
        variant: 'destructive',
      });
      return;
    }
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'Session expired. Please sign in again.',
        variant: 'destructive',
      });
      return;
    }
    await sendMessageToAI(newMessage);
  };

  const sendMessageToAI = async (messageContent: string) => {
    if (!user?.id || !messageContent.trim()) {
      return;
    }

    // Send user message
    onSendMessage(messageContent, false); // Mark as user message

    setIsTyping(true);

    // Map messages to AIMessage format for the AI service
    const messageHistory: AIMessage[] = messages.map((msg) => ({
      _id: msg._id,
      sender: msg.sender
        ? { _id: msg.sender._id || msg.sender.id } // Handle both _id and id
        : typeof msg.senderId === 'string'
        ? { _id: msg.senderId }
        : { _id: user.id },
      content: msg.content,
      createdAt: msg.createdAt,
      isAIResponse: msg.isAIResponse,
      role: msg.isAIResponse ? 'ai' : 'user',
    }));

    messageHistory.push({
      _id: Date.now().toString(),
      sender: { _id: user.id },
      content: messageContent,
      createdAt: new Date().toISOString(),
      role: 'user',
    });

    try {
      const aiResponse = await generateAIResponse(messageHistory);
      onSendMessage(aiResponse, true); // Mark as AI response
      setNewMessage('');
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } catch (error) {
      toast({
        title: 'AI Error',
        description: 'Failed to get a response from Shree. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetMessageClick = (message: string) => {
    setNewMessage(message);
    sendMessageToAI(message);
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-3 border-b flex items-center">
          <Avatar className="h-9 w-9 mr-3 animate-pulse bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse mt-1"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
            <div className="rounded-lg py-2 px-3 bg-gray-200 animate-pulse h-10 w-32"></div>
          </div>
          <div className="flex justify-end">
            <div className="rounded-lg py-2 px-3 bg-gray-200 animate-pulse h-10 w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <style>{gradientKeyframes}</style>
      <div className="p-3 border-b flex items-center sticky top-0 z-10 bg-white">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar
          className="h-9 w-9 mr-3 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 animate-[gradientShift_6s_ease_infinite] bg-[length:200%_200%]"
        >
          <AvatarImage src="/luna-ai-avatar.png" alt="Shree AI" />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 text-white animate-[gradientShift_6s_ease_infinite] bg-[length:200%_200%]">
            <Sparkles className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-base font-semibold">Shree AI</h2>
          <p className="text-xs text-gray-500">
            {isTyping ? <span className="text-purple-500">Typing...</span> : 'Active now'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hidden">
        {isOwnAI ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-100 rounded-lg border border-gray-200">
            <AlertCircle className="h-8 w-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-600">
              You cannot message yourself. You are the creator of Shree AI.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-purple-100 p-6 rounded-full mb-4">
              <Sparkles className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Meet Shree</h3>
            <p className="text-gray-500 max-w-sm">
              Hi! I'm Shree, your AI assistant. I'm here to help answer your questions and have a friendly chat. What's on your mind today?
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              // Determine if the message is from AI using isAIResponse
              const isAI = message.isAIResponse === true;

              // Fallback: Use sender.id or sender._id to determine ownership
              let isOwnMessage = !isAI;
              if (user?.id) {
                const senderId = message.sender?.id || message.sender?._id; // Check both id and _id
                isOwnMessage = senderId === user.id;
              }

              return (
                <motion.div
                  key={message._id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-7 w-7 mt-1 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 animate-[gradientShift_6s_ease_infinite] bg-[length:200%_200%]">
                      <AvatarImage src="/luna-ai-avatar.png" alt="Shree AI" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 text-white animate-[gradientShift_6s_ease_infinite] bg-[length:200%_200%]">
                        <Sparkles className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-usm-gold text-white rounded-br-none'
                          : 'bg-purple-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        {isTyping && !isOwnAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <Avatar className="h-7 w-7 mt-1 mr-2 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 animate-[gradientShift_6s_ease_infinite] bg-[length:200%_200%]">
              <AvatarFallback className="bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 text-white animate-[gradientShift_6s_ease_infinite] bg-[length:200%_200%]">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-purple-100 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isOwnAI && messages.length === 0 && (
        <div className="px-4 pb-2 pt-2">
          <div className="flex flex-wrap gap-2">
            {presetMessages.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800"
                onClick={() => handlePresetMessageClick(message)}
                disabled={isTyping}
              >
                {message}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t bg-white flex items-center">
        {isOwnAI ? (
          <div className="flex-1 text-center text-sm text-gray-600">
            Messaging disabled: You are the creator of Shree AI.
          </div>
        ) : (
          <>
            <Input
              ref={inputRef}
              placeholder="Ask Shree something..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping || authLoading}
              className="flex-1 mr-2 rounded-full border-gray-300 text-sm py-2 px-4 focus:ring-0 focus:border-gray-400"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isTyping || authLoading}
              className="rounded-full h-9 w-9 p-0 flex items-center justify-center bg-usm-gold hover:bg-yellow-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AIMessageThread;