
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Conversation, Message } from "@/types/message";
import { Send, ArrowLeft, MoreVertical, Image, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
  isMobile: boolean;
}

const MessageThread = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  onBack,
  isMobile
}: MessageThreadProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation?.participants.find(p => p.id !== '1');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <Send className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium mb-2">Your Messages</h3>
        <p className="max-w-sm">Select a conversation from the list or start a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name || 'User'} />
          <AvatarFallback>{otherParticipant?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-medium">{otherParticipant?.name}</h4>
          <p className="text-xs text-gray-500">Active now</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === '1';
          const sender = conversation.participants.find(p => p.id === message.senderId);

          return (
            <div 
              key={message.id} 
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwnMessage && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src={sender?.avatar} alt={sender?.name || 'User'} />
                  <AvatarFallback>{sender?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <div 
                  className={`inline-block rounded-lg py-2 px-3 max-w-xs break-words ${
                    isOwnMessage 
                    ? 'bg-usm-gold text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <Image className="h-5 w-5" />
          </Button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 py-2 px-3 rounded-full border focus:ring-2 focus:ring-usm-gold focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newMessage.trim()}
            className={`rounded-full ${!newMessage.trim() ? 'opacity-50' : ''}`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
