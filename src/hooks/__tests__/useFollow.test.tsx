import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFollow } from '../useFollow';
import { followUser, unfollowUser } from '../../services/api/follow.service';
import { useSession } from 'next-auth/react';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('../../services/api/follow.service');

// Setup types for mocks
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockFollowUser = followUser as jest.MockedFunction<typeof followUser>;
const mockUnfollowUser = unfollowUser as jest.MockedFunction<typeof unfollowUser>;

describe('useFollow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { accessToken: 'fake-token' } },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('handles following a user in suggestion context', async () => {
    const mockResponse = {
      success: true,
      data: { followingCount: 42 },
    };
    (followUser as jest.Mock).mockResolvedValue(mockResponse);

    // Initial suggestion data in cache
    queryClient.setQueryData(['suggestions'], {
      suggestions: [{
        id: 'user-123',
        username: 'testuser',
        name: 'Test User',
        _count: { followers: 41 },
        isFollowedByUser: false,
      }],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useFollow({
          userId: 'user-123',
          context: 'suggestion',
        }),
      { wrapper }
    );

    // Initial state
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(41);

    // Follow the user
    await act(async () => {
      result.current.toggleFollow();
    });

    // Check optimistic update
    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followerCount).toBe(42);

    // Verify API was called
    expect(followUser).toHaveBeenCalledWith('user-123', expect.any(Object));

    // Verify cache was updated
    const suggestions = queryClient.getQueryData<{ suggestions: any[] }>(['suggestions']);
    expect(suggestions?.suggestions[0].isFollowedByUser).toBe(true);
    expect(suggestions?.suggestions[0]._count.followers).toBe(42);
  });

  it('handles unfollowing a user in profile context', async () => {
    const mockResponse = { success: true };
    (unfollowUser as jest.Mock).mockResolvedValue(mockResponse);

    // Initial profile data in cache
    queryClient.setQueryData(['follower-info', 'user-123'], {
      followers: 42,
      isFollowedByUser: true,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useFollow({
          userId: 'user-123',
          context: 'profile',
          initialFollowerCount: 42,
          initialIsFollowing: true,
        }),
      { wrapper }
    );

    // Initial state
    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followerCount).toBe(42);

    // Unfollow the user
    await act(async () => {
      result.current.toggleFollow();
    });

    // Check optimistic update
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(41);

    // Verify API was called
    expect(unfollowUser).toHaveBeenCalledWith('user-123', expect.any(Object));

    // Verify cache was updated
    const followerInfo = queryClient.getQueryData<FollowerInfo>(['follower-info', 'user-123']);
    expect(followerInfo?.isFollowedByUser).toBe(false);
    expect(followerInfo?.followers).toBe(41);
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    (followUser as jest.Mock).mockRejectedValue(mockError);

    // Initial suggestion data
    queryClient.setQueryData(['suggestions'], {
      suggestions: [{
        id: 'user-123',
        username: 'testuser',
        name: 'Test User',
        _count: { followers: 41 },
        isFollowedByUser: false,
      }],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useFollow({
          userId: 'user-123',
          context: 'suggestion',
        }),
      { wrapper }
    );

    // Follow attempt
    await act(async () => {
      result.current.toggleFollow();
    });

    // Should revert to original state
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followerCount).toBe(41);

    // Verify cache was reverted
    const suggestions = queryClient.getQueryData<{ suggestions: any[] }>(['suggestions']);
    expect(suggestions?.suggestions[0].isFollowedByUser).toBe(false);
    expect(suggestions?.suggestions[0]._count.followers).toBe(41);
  });
});