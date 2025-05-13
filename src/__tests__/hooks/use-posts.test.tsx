import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePosts } from '@/hooks/use-posts';
import { vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('usePosts', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should fetch posts successfully', async () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(Array.isArray(result.current.posts)).toBe(true);
  });

  it('should handle post creation', async () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    const newPost = {
      content: 'Test post',
      type: 'post' as const,
    };

    await act(async () => {
      await result.current.handleCreatePost(newPost);
    });

    expect(result.current.posts[0].content).toBe('Test post');
  });
}); 