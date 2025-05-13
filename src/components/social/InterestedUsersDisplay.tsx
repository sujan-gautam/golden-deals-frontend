import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { User } from '@/types/user';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { markInterestedInEvent } from '@/services/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatModal from './ChatModal';

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL ;

interface InterestedUsersDisplayProps {
  interestedUsers: User[];
  eventTitle: string;
  eventId: string;
  eventInterested?: number | string[];
  eventIsInterested?: boolean;
}

const InterestedUsersDisplay: React.FC<InterestedUsersDisplayProps> = ({
  interestedUsers,
  eventTitle,
  eventId,
  eventInterested = 0,
  eventIsInterested = false,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [eventState, setEventState] = useState({
    isInterested: eventIsInterested,
    interestedCount:
      typeof eventInterested === 'number'
        ? eventInterested
        : Array.isArray(eventInterested)
        ? eventInterested.length
        : 0,
  });
  const [isUsersVisible, setIsUsersVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // For chat modal

  // Filter out users with invalid _id
  const validUsers = interestedUsers.filter((user) => {
    const isValid = user._id && user._id !== 'undefined' && user._id !== 'unknown';
    if (!isValid) {
      console.warn('Filtered out invalid user:', user);
    }
    return isValid;
  });

  const getAvatarPath = (avatar: string | undefined | null): string => {
    if (!avatar) return `${IMAGE_URL}/default-avatar.jpg`;
    return avatar.startsWith('http') ? avatar : `${IMAGE_URL}${avatar}`;
  };

  const getAvatarFallback = (user: User): string => {
    const displayName =
      user.firstname && user.lastname
        ? `${user.firstname} ${user.lastname}`
        : user.username || 'Unknown';
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  const handleMarkInterested = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to mark interest.',
        variant: 'destructive',
      });
      return;
    }

    const previousState = { ...eventState };
    setEventState({
      isInterested: !eventState.isInterested,
      interestedCount: eventState.isInterested
        ? eventState.interestedCount - 1
        : eventState.interestedCount + 1,
    });

    const previousData = queryClient.getQueryData(['interestedEvents', user.id]);
    queryClient.setQueryData(['interestedEvents', user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        authoredEventsWithInterestedUsers: old.authoredEventsWithInterestedUsers.map(
          ({ event, interestedUsers }: { event: any; interestedUsers: User[] }) =>
            event._id === eventId
              ? {
                  event: {
                    ...event,
                    isInterested: !eventState.isInterested,
                    interested: eventState.isInterested
                      ? Array.isArray(event.interested)
                        ? event.interested.filter((id: string) => id !== user.id)
                        : (event.interested || 0) - 1
                      : Array.isArray(event.interested)
                      ? [...event.interested, user.id]
                      : (event.interested || 0) + 1,
                  },
                  interestedUsers: eventState.isInterested
                    ? interestedUsers.filter((u: User) => u._id !== user.id)
                    : [
                        ...interestedUsers,
                        {
                          _id: user.id,
                          username: user.username,
                          firstname: user.firstname,
                          lastname: user.lastname,
                          email: user.email || '',
                          avatar: user.avatar,
                          name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username,
                        },
                      ],
                }
              : { event, interestedUsers }
        ),
      };
    });

    try {
      await markInterestedInEvent(eventId);
      toast({
        title: 'Success',
        description: eventState.isInterested ? 'Interest removed' : 'Marked as interested',
      });
    } catch (error: any) {
      setEventState(previousState);
      queryClient.setQueryData(['interestedEvents', user.id], previousData);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark interest.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenChat = (user: User) => {
    if (!isAuthenticated || !user._id) {
      toast({
        title: 'Error',
        description: 'Please sign in to start a chat.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedUser(user);
  };

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        onClick={() => setIsUsersVisible(!isUsersVisible)}
        className="w-full flex justify-between items-center text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className={`h-5 w-5 ${eventState.isInterested ? 'text-green-600' : 'text-gray-500'}`} />
          <span className="font-semibold">
            {eventState.interestedCount} Interested in {eventTitle}
          </span>
        </div>
        {isUsersVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </Button>
      {isUsersVisible && (
        <Card className="p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Interested Users</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkInterested}
                    className={`flex items-center gap-2 transition-colors ${
                      eventState.isInterested
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                        : 'border-gray-300 text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Users
                      className={`h-4 w-4 ${eventState.isInterested ? 'fill-green-700' : ''}`}
                    />
                    {eventState.isInterested ? 'Interested' : 'Join'} ({eventState.interestedCount})
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {eventState.isInterested ? 'Click to remove interest' : 'Click to join the event'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {validUsers.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No users have marked interest in this event yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {validUsers.map((user) => (
                <TooltipProvider key={user._id?.toString()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-blue-300 transition-all">
                          <AvatarImage
                            src={getAvatarPath(user.avatar)}
                            alt={user.username || 'User'}
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {getAvatarFallback(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name ||
                              (user.firstname && user.lastname
                                ? `${user.firstname} ${user.lastname}`
                                : user.username || 'Unknown')}
                          </p>
                          <p className="text-xs text-gray-500 truncate">@{user.username || 'unknown'}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenChat(user)}
                          disabled={!user._id}
                          className={`${
                            !user._id
                              ? 'opacity-50 cursor-not-allowed'
                              : 'text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                          } transition-colors`}
                          aria-label={`Chat with ${user.username || 'user'}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Chat with {user.username || 'user'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </Card>
      )}
      {selectedUser && (
        <ChatModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          recipient={{
            id: selectedUser._id?.toString() || '',
            name:
              selectedUser.name ||
              (selectedUser.firstname && selectedUser.lastname
                ? `${selectedUser.firstname} ${selectedUser.lastname}`
                : selectedUser.username || 'Unknown'),
            avatar: selectedUser.avatar || '',
          }}
          event={{
            _id: eventId,
            title: eventTitle,
          }}
        />
      )}
    </div>
  );
};

export default InterestedUsersDisplay;