// src/hooks/use-interested-events.ts
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './use-auth';
import { getInterestedEvents, getUsersInterestedInMyEvents } from '../services/interested-api';
import { EventPost } from '../types/post';
import { User } from '../types/user';

interface InterestedEventsResponse {
  interestedEvents: EventPost[];
  authoredEventsWithInterestedUsers: { event: EventPost; interestedUsers: User[] }[];
}

export const useInterestedEvents = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: interestedData = { interestedEvents: [], authoredEventsWithInterestedUsers: [] },
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery<InterestedEventsResponse>({
    queryKey: ['interestedEvents', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        return { interestedEvents: [], authoredEventsWithInterestedUsers: [] };
      }

      try {
        const [interestedEvents, authoredEventsWithInterestedUsers] = await Promise.all([
          getInterestedEvents(),
          getUsersInterestedInMyEvents(),
        ]);

        return {
          interestedEvents,
          authoredEventsWithInterestedUsers,
        };
      } catch (err: any) {
        console.error('Query error:', {
          message: err.message,
          stack: err.stack,
          userId: user.id,
        });
        throw err;
      }
    },
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
    onError: (err: any) => {
      const errorMessage = err.message || 'Failed to load interested events.';
      console.error('useQuery onError:', { errorMessage, userId: user?.id });
      toast({
        title: 'Error fetching interested events',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const refetchInterestedEvents = useCallback(() => {
    setIsLoading(true);
    refetch().finally(() => setIsLoading(false));
  }, [refetch]);

  return {
    interestedEvents: interestedData.interestedEvents,
    authoredEventsWithInterestedUsers: interestedData.authoredEventsWithInterestedUsers,
    isLoading: isQueryLoading || isLoading,
    error,
    refetchInterestedEvents,
  };
};

