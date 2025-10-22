# Follow/Unfollow Feature Implementation

This document describes the complete implementation of the Follow/Unfollow button feature for the Next.js 15 social media app, adapted for a microservices architecture.

## Architecture Overview

```
Next.js 15 Client (Server Actions + React Query)
    ↓ HTTP JSON calls with JWT Bearer token
API Gateway (/users/:userId/followers)
    ↓ gRPC calls
User Service Backend (follow logic)
```

## Key Features

- ✅ **Optimistic Updates**: Instant UI feedback with rollback on error
- ✅ **Server Actions**: Preload data for better performance
- ✅ **React Query**: Advanced caching and state management
- ✅ **JWT Authentication**: Secure API calls with NextAuth
- ✅ **Error Handling**: Comprehensive error handling with toast notifications
- ✅ **TypeScript**: Fully typed implementation
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ✅ **Responsive Design**: Multiple button variants and sizes

## Components

### 1. useFollowerInfo Hook (`src/customHooks/useFollowerInfo.ts`)

A React Query hook that manages follower state with optimistic updates.

**Key Features:**
- Optimistic updates with rollback on error
- Automatic retry logic (excludes 401 errors)
- Toast notifications for success/error states
- Automatic redirect on authentication failure
- Query invalidation for related data

**Usage:**
```typescript
const { toggleFollow, isFollowing, isPending, followerInfo } = useFollowerInfo({
  userId: "user123",
  initialData: { followers: 10, isFollowedByUser: false }
});
```

### 2. FollowButton Component (`src/components/FollowButton.tsx`)

A flexible button component with multiple variants and sizes.

**Variants:**
- `default`: Solid background with hover effects
- `outline`: Border with transparent background
- `ghost`: Text-only with hover background

**Sizes:**
- `sm`: Small (32px height)
- `md`: Medium (40px height) 
- `lg`: Large (48px height)

**Specialized Components:**
- `FollowButtonCompact`: For lists and sidebars
- `FollowButtonText`: Text-only minimal version

### 3. Server Actions (`src/app/actions/follow.ts`)

Server-side functions for preloading data and handling authentication.

**Functions:**
- `getFollowerInfoAction(userId)`: Get follower info for a single user
- `getMultipleFollowerInfoAction(userIds)`: Get follower info for multiple users
- `getSuggestedUsersWithFollowerInfo(limit)`: Get suggestions with preloaded follower info

### 4. Updated Profile Service (`src/services/api/profile.service.ts`)

Updated to use `ky` library with proper error handling and authentication.

**Features:**
- Automatic JWT token injection
- Global 401 error handling
- Retry logic for network failures
- TypeScript support

## Integration Examples

### Basic Usage

```typescript
import { FollowButton } from "@/src/components/FollowButton";

function UserProfile({ userId }: { userId: string }) {
  return (
    <FollowButton
      userId={userId}
      initialData={{ followers: 0, isFollowedByUser: false }}
      variant="default"
      size="lg"
    />
  );
}
```

### With Server Action Preloading

```typescript
import { getFollowerInfoAction } from "@/src/app/actions/follow";
import { FollowButton } from "@/src/components/FollowButton";

async function UserProfile({ userId }: { userId: string }) {
  // Preload data on the server
  const initialData = await getFollowerInfoAction(userId);
  
  return (
    <FollowButton
      userId={userId}
      initialData={initialData}
      variant="default"
      size="lg"
    />
  );
}
```

### In Lists/Sidebars

```typescript
import { FollowButtonText } from "@/src/components/FollowButton";
import { getSuggestedUsersWithFollowerInfo } from "@/src/app/actions/follow";

async function WhoToFollowSidebar() {
  const { suggestions, followerInfoMap } = await getSuggestedUsersWithFollowerInfo(5);
  
  return (
    <div>
      {suggestions.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <div>
            <h4>{user.name}</h4>
            <p>@{user.username}</p>
          </div>
          <FollowButtonText
            userId={user.id}
            initialData={followerInfoMap[user.id]}
          />
        </div>
      ))}
    </div>
  );
}
```

## Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
LOCAL_APIGATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_IMAGE_PATH=http://localhost:3000/images/
```

## API Endpoints

The implementation expects these endpoints in your API Gateway:

- `GET /auth/:userId/followers` - Get follower info
- `POST /follow` - Follow a user
- `DELETE /unfollow` - Unfollow a user
- `GET /follows/suggestions?limit=5` - Get user suggestions

## Error Handling

The implementation handles various error scenarios:

1. **401 Unauthorized**: Redirects to `/signIn`
2. **403 Forbidden**: Shows "You cannot follow this user"
3. **Network Errors**: Retries with exponential backoff
4. **Server Errors**: Shows generic error message

## Performance Optimizations

1. **Server Actions**: Preload data to avoid client-side loading states
2. **React Query**: Intelligent caching with `staleTime: Infinity`
3. **Optimistic Updates**: Instant UI feedback
4. **Parallel Requests**: Fetch multiple user data simultaneously
5. **Cache Invalidation**: Smart invalidation of related queries

## Testing

The implementation is designed to be testable:

```typescript
// Mock the hook for testing
jest.mock('@/src/customHooks/useFollowerInfo', () => ({
  useFollowerInfo: () => ({
    toggleFollow: jest.fn(),
    isFollowing: false,
    isPending: false,
    followerInfo: { followers: 10, isFollowedByUser: false }
  })
}));
```

## Best Practices

1. **Always preload data** in server components when possible
2. **Use appropriate button variants** for different contexts
3. **Handle loading states** gracefully
4. **Provide fallback UI** for error states
5. **Test optimistic updates** thoroughly
6. **Monitor API performance** and adjust retry logic

## Migration from YouTuber's Code

Key improvements over the original implementation:

1. **Better Error Handling**: Comprehensive error handling for microservices
2. **Server Actions**: Preloading data for better performance
3. **TypeScript**: Full type safety
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Flexibility**: Multiple button variants and sizes
6. **Performance**: Optimistic updates and intelligent caching

## Troubleshooting

### Common Issues

1. **401 Errors**: Check JWT token validity and NextAuth configuration
2. **Slow Loading**: Ensure server actions are preloading data
3. **Stale Data**: Check React Query cache configuration
4. **Button Not Appearing**: Verify user authentication state

### Debug Mode

Enable React Query DevTools for debugging:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live follower counts
2. **Bulk Operations**: Follow/unfollow multiple users
3. **Analytics**: Track follow/unfollow events
4. **Rate Limiting**: Client-side rate limiting for API calls
5. **Offline Support**: Service worker for offline functionality
