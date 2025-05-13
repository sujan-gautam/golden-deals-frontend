import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, UserPlus } from 'lucide-react';
import { searchUsers } from '@/services/api';
import { User } from '@/types/message';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string) => void;
}

// Memoized SearchInput to prevent re-renders
const SearchInput = React.memo(
  ({
    searchQuery,
    setSearchQuery,
    loading,
    inputRef,
  }: {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    loading: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    useEffect(() => {
      console.log('SearchInput mounted');
      return () => console.log('SearchInput unmounted');
    }, []);

    return (
      <div className="relative mt-4 mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="Search by name or username..."
          className="pl-10 rounded-full bg-gray-100 border-none focus:ring-0 focus:bg-gray-200 transition-colors"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            console.log('Input active element:', document.activeElement);
          }}
          disabled={loading}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.searchQuery === nextProps.searchQuery &&
      prevProps.loading === nextProps.loading &&
      prevProps.setSearchQuery === nextProps.setSearchQuery &&
      prevProps.inputRef === nextProps.inputRef
    );
  }
);

// Memoized ModalContent to prevent re-renders
const ModalContent = React.memo(
  ({
    searchState,
    filteredUsers,
    selectedUserId,
    setSelectedUserId,
    handleStartConversation,
    handleClose,
    IMAGE_URL,
  }: {
    searchState: { users: User[]; loading: boolean };
    filteredUsers: User[];
    selectedUserId: string | null;
    setSelectedUserId: (id: string | null) => void;
    handleStartConversation: () => void;
    handleClose: () => void;
    IMAGE_URL: string;
  }) => {
    return (
      <>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Find someone to message</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[300px] -mx-6 px-6">
          {searchState.loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="mt-2 text-sm">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">
              Type to search users
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const displayName =
                  `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
                  user.username ||
                  'Unknown';
                const avatarSrc = user.avatar ? `${IMAGE_URL}${user.avatar}` : undefined;

                console.log('NewConversationModal - User ID:', user._id);
                console.log('NewConversationModal - Display name:', displayName);
                console.log('NewConversationModal - Avatar src:', avatarSrc);

                return (
                  <div
                    key={user._id}
                    className={`flex items-center p-3 cursor-pointer rounded-md hover:bg-gray-100 transition-colors ${
                      selectedUserId === user._id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedUserId(user._id)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage
                        src={avatarSrc}
                        alt={displayName}
                        onError={() =>
                          console.error(`Failed to load avatar for ${displayName}: ${avatarSrc}`)
                        }
                      />
                      <AvatarFallback className="bg-gray-300 text-gray-600">
                        {displayName[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <h4 className="font-medium text-sm">{displayName}</h4>
                      {user.username && (
                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                      )}
                    </div>
                    {selectedUserId === user._id && (
                      <div className="h-5 w-5 rounded-full bg-usm-gold text-white flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStartConversation}
            disabled={!selectedUserId || searchState.loading}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Start
          </Button>
        </DialogFooter>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.searchState.users === nextProps.searchState.users &&
      prevProps.searchState.loading === nextProps.searchState.loading &&
      prevProps.filteredUsers === nextProps.filteredUsers &&
      prevProps.selectedUserId === nextProps.selectedUserId &&
      prevProps.setSelectedUserId === nextProps.setSelectedUserId &&
      prevProps.handleStartConversation === nextProps.handleStartConversation &&
      prevProps.handleClose === nextProps.handleClose &&
      prevProps.IMAGE_URL === nextProps.IMAGE_URL
    );
  }
);

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onStartConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchState, setSearchState] = useState<{ users: User[]; loading: boolean }>({
    users: [],
    loading: false,
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryCache = useRef<Map<string, User[]>>(new Map());
  const renderCount = useRef(0);

  // Consistent with ConversationList
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  // Increment render count
  renderCount.current += 1;
  console.log(`NewConversationModal render #${renderCount.current}, searchQuery=`, searchQuery);

  // Memoize fetchUsers
  const fetchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchState({ users: [], loading: false });
        return;
      }

      const normalizedQuery = query.trim().toLowerCase();
      if (queryCache.current.has(normalizedQuery)) {
        setSearchState({ users: queryCache.current.get(normalizedQuery)!, loading: false });
        return;
      }

      setSearchState((prev) => ({ ...prev, loading: true }));
      try {
        console.log('Searching users with query:', normalizedQuery);
        const fetchedUsers = await searchUsers(normalizedQuery);
        console.log('Fetched users:', fetchedUsers);
        if (!Array.isArray(fetchedUsers)) {
          throw new Error('Invalid API response: Expected array');
        }

        queryCache.current.set(normalizedQuery, fetchedUsers);
        setSearchState({ users: fetchedUsers, loading: false });
        if (fetchedUsers.length === 0 && query.trim()) {
          toast({
            title: 'No Results',
            description: 'No users found for your search.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users. Please try again.',
          variant: 'destructive',
        });
        setSearchState({ users: [], loading: false });
      }
    },
    [toast]
  );

  // Memoize filteredUsers
  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return searchState.users.filter((user) => {
      const displayName = `${user.firstname || ''} ${user.lastname || ''}`.trim().toLowerCase();
      const username = user.username?.toLowerCase() || '';
      return displayName.includes(normalizedQuery) || username.includes(normalizedQuery);
    });
  }, [searchState.users, searchQuery]);

  // Handle search API calls
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchState({ users: [], loading: false });
      setSelectedUserId(null);
      queryCache.current.clear();
      return;
    }

    const debounce = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen, fetchUsers]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      console.log('Focused input on modal open');
    }
  }, [isOpen]);

  // Detect typing pause and refocus after 2.5 seconds if focus is lost
  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        console.log('Refocused input after 2.5s typing pause');
      }
    }, 2500);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [searchQuery, isOpen]);

  const handleStartConversation = useCallback(() => {
    if (selectedUserId) {
      onStartConversation(selectedUserId);
      handleClose();
    }
  }, [selectedUserId, onStartConversation]);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedUserId(null);
    setSearchQuery('');
    setSearchState({ users: [], loading: false });
    queryCache.current.clear();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={searchState.loading}
          inputRef={inputRef}
        />
        <ModalContent
          searchState={searchState}
          filteredUsers={filteredUsers}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          handleStartConversation={handleStartConversation}
          handleClose={handleClose}
          IMAGE_URL={IMAGE_URL}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;