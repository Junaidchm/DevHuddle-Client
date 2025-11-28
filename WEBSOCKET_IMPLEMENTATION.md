# WebSocket Implementation - Production-Ready Architecture

## 📋 Overview

This document describes the production-ready WebSocket implementation following industry best practices used by companies like LinkedIn, Twitter, and other major tech platforms.

## 🏗️ Architecture

### **Single WebSocket Connection Per User Session**

✅ **Industry Standard**: One WebSocket connection per authenticated user session, shared across the entire application.

**Why?**
- Reduces server load
- Prevents connection exhaustion
- Simplifies state management
- Better resource utilization
- Easier to monitor and debug

### **Singleton Pattern**

The WebSocket connection is managed by a singleton `WebSocketManager` class that ensures:
- Only one connection exists at a time
- Connection state is shared across all components
- Proper cleanup and resource management

### **Context Provider at Root Level**

The `WebSocketProvider` is placed in the root `Providers` component, ensuring:
- Connection is established when the app loads
- Available to all components via `useWebSocket()` hook
- Proper lifecycle management (connect on mount, disconnect on logout)

## 🎯 Key Features

### 1. **Visibility API Integration**
- Pauses connection when browser tab is hidden
- Automatically reconnects when tab becomes visible
- Saves resources and battery on mobile devices

### 2. **Network Status Handling**
- Detects online/offline events
- Automatically reconnects when network comes back online
- Handles network interruptions gracefully

### 3. **Exponential Backoff Reconnection**
- Reconnects with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max)
- Maximum 5 reconnection attempts
- Prevents server overload during outages

### 4. **Authentication Flow**
- Token-based authentication after connection
- 5-second authentication timeout
- Proper error handling for auth failures

### 5. **Heartbeat/Ping-Pong**
- Server-side heartbeat (30s interval)
- Automatic dead connection detection
- Cleanup of stale connections

### 6. **Type-Safe Message Handling**
- TypeScript interfaces for all message types
- Proper error handling and validation
- Safe message parsing

## 📁 File Structure

```
client/
├── src/
│   ├── contexts/
│   │   └── WebSocketContext.tsx    # Main WebSocket implementation
│   ├── store/
│   │   └── providers.tsx           # Root providers (includes WebSocketProvider)
│   └── components/
│       └── layouts/
│           └── NavBar.tsx          # Uses WebSocket via context (no direct hook)
```

## 🔧 Usage

### In Components

```tsx
import { useWebSocket } from "@/src/contexts/WebSocketContext";

function MyComponent() {
  const { connectionState, isConnected, sendMessage, reconnect } = useWebSocket();

  // Check connection state
  if (connectionState === "connected") {
    // Connection is active
  }

  // Send a message
  sendMessage({
    type: "custom_message",
    data: { /* your data */ }
  });

  // Manually reconnect if needed
  reconnect();
}
```

### Connection States

- `disconnected` - No connection
- `connecting` - Establishing connection
- `authenticating` - Authenticating with server
- `connected` - Fully connected and authenticated
- `reconnecting` - Attempting to reconnect after disconnection

## 🚀 How Big Tech Companies Do It

### LinkedIn Approach
- Single WebSocket connection per user session
- Context Provider at root level
- Visibility API for resource optimization
- Exponential backoff for reconnections
- Server-side connection pooling

### Twitter Approach
- One WebSocket connection shared across all features
- Automatic reconnection with backoff
- Network status awareness
- Graceful degradation when offline

### Our Implementation
✅ Follows the same patterns as LinkedIn and Twitter
✅ Production-ready with proper error handling
✅ Optimized for performance and resource usage
✅ Type-safe and maintainable

## 🔒 Security

1. **Token-Based Authentication**
   - Token sent after connection (not in URL)
   - 5-second authentication timeout
   - Automatic disconnection on auth failure

2. **Connection Limits**
   - Server enforces max 5 connections per user
   - Prevents connection abuse

3. **Path Validation**
   - Server validates WebSocket path
   - Rejects invalid connection attempts

## 📊 Monitoring & Debugging

### Connection State Monitoring
```tsx
const { connectionState } = useWebSocket();
console.log("WebSocket state:", connectionState);
```

### Console Logs
All WebSocket events are logged with `[WebSocket]` prefix:
- Connection established
- Authentication success/failure
- Reconnection attempts
- Network status changes
- Visibility changes

## 🐛 Troubleshooting

### Connection Not Establishing
1. Check if user is authenticated (`session?.user?.accessToken`)
2. Verify WebSocket URL in environment variables
3. Check browser console for errors
4. Verify server is running and accessible

### Frequent Disconnections
1. Check network stability
2. Verify server heartbeat is working
3. Check for firewall/proxy issues
4. Review server logs for connection errors

### Messages Not Received
1. Verify connection state is `connected`
2. Check message format matches server expectations
3. Verify authentication was successful
4. Check server logs for message processing errors

## 🔄 Migration from Old Implementation

### Before (❌ Not Recommended)
```tsx
// In NavBar component
import { useWebSocketNotifications } from "@/src/customHooks/useWebSocketNotifications";

export default function NavBar() {
  useWebSocketNotifications(); // ❌ Creates connection in component
  // ...
}
```

### After (✅ Production-Ready)
```tsx
// In Providers component (root level)
import { WebSocketProvider } from "@/src/contexts/WebSocketContext";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider>
        <WebSocketProvider> {/* ✅ At root level */}
          {children}
        </WebSocketProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

// In any component
import { useWebSocket } from "@/src/contexts/WebSocketContext";

function MyComponent() {
  const { isConnected } = useWebSocket(); // ✅ Use context
  // ...
}
```

## 📈 Performance Optimizations

1. **Singleton Pattern** - Only one connection instance
2. **Visibility API** - Pause when tab hidden
3. **Network Awareness** - Handle offline gracefully
4. **Exponential Backoff** - Prevent server overload
5. **Proper Cleanup** - No memory leaks

## 🎓 Best Practices

1. ✅ **Always use the context hook** - Don't create new connections
2. ✅ **Check connection state** - Before sending messages
3. ✅ **Handle errors gracefully** - Show user-friendly messages
4. ✅ **Monitor connection state** - For debugging and UX
5. ✅ **Don't reconnect manually** - Let the system handle it

## 🔮 Future Enhancements

Potential improvements for even better production readiness:
- [ ] Connection quality metrics
- [ ] Message queuing when offline
- [ ] Compression for large messages
- [ ] Connection pooling for multiple tabs
- [ ] Analytics and monitoring integration

## 📚 References

- [WebSocket API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Page Visibility API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [React Context API](https://react.dev/reference/react/createContext)
- [Exponential Backoff Algorithm](https://en.wikipedia.org/wiki/Exponential_backoff)

---

**Last Updated**: 2024
**Maintained By**: Development Team

