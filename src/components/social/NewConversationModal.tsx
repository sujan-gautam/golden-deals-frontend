
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string) => void;
}

const users: User[] = [
  { id: '2', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Emily Williams', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'James Miller', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: '6', name: 'Olivia Davis', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { id: '7', name: 'Noah Wilson', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
  { id: '8', name: 'Sophia Taylor', avatar: 'https://randomuser.me/api/portraits/women/8.jpg' },
];

const NewConversationModal = ({ isOpen, onClose, onStartConversation }: NewConversationModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartConversation = () => {
    if (selectedUserId) {
      onStartConversation(selectedUserId);
      onClose();
      setSelectedUserId(null);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUserId(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for a user to start messaging
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto max-h-[300px] -mx-6 px-6">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No users found matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center p-3 cursor-pointer rounded-md hover:bg-gray-100 transition-colors ${
                    selectedUserId === user.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{user.name}</h4>
                  </div>
                  {selectedUserId === user.id && (
                    <div className="h-5 w-5 rounded-full bg-usm-gold text-white flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartConversation} 
            disabled={!selectedUserId}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Start Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;
