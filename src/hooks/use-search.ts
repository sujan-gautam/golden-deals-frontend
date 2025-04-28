import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { searchAll, advancedSearch, SearchResult } from '../services/search-api';

export const useSearch = (initialQuery: string = '') => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [advancedFilters, setAdvancedFilters] = useState<{
    type?: 'users' | 'posts' | 'products' | 'events';
    userId?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    condition?: string;
    eventDateFrom?: string;
    eventDateTo?: string;
    location?: string;
  }>({});

  const searchQueryFn = async (): Promise<SearchResult> => {
    console.log('searchQueryFn called with query:', searchQuery, 'filters:', advancedFilters);
    if (Object.keys(advancedFilters).length > 0) {
      return advancedSearch({ query: searchQuery, ...advancedFilters });
    }
    return searchAll(searchQuery);
  };

  const {
    data: results = { users: [], posts: [], products: [], events: [] },
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', searchQuery, JSON.stringify(advancedFilters)],
    queryFn: searchQueryFn,
    enabled: !!searchQuery.trim(),
    retry: 1,
    onSuccess: (data) => {
      console.log('useQuery onSuccess - results:', data);
    },
    onError: (err: any) => {
      console.error('useQuery error:', err);
      toast({
        title: 'Search Error',
        description: err.message || 'Failed to perform search.',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = useCallback(
    (query: string, filters = {}) => {
      console.log('handleSearch called with query:', query, 'filters:', filters);
      setSearchQuery(query);
      setAdvancedFilters(filters);
      if (query.trim()) {
        refetch();
      }
    },
    [refetch]
  );

  const clearSearch = useCallback(() => {
    console.log('clearSearch called');
    setSearchQuery('');
    setAdvancedFilters({});
  }, []);

  console.log('useSearch state:', { searchQuery, advancedFilters, results, isLoading, isFetching, error });

  return {
    searchQuery,
    setSearchQuery,
    advancedFilters,
    setAdvancedFilters,
    results,
    isLoading,
    isFetching,
    error,
    handleSearch,
    clearSearch,
    refetch,
  };
};