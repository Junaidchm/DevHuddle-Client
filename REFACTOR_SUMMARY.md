# NextAuth Refactor - Summary & Next Steps

## ✅ Completed Refactoring

### Critical Issues Fixed

1. **Removed excessive session calls** - Fixed axios interceptor that was calling `getSession()` on every request
2. **Fixed invalid React hooks** - Removed `useSession()` calls from utility functions
3. **Removed duplicate refresh logic** - Cleaned up token refresh to only use NextAuth JWT callback
4. **Optimized SessionProvider** - Added proper refetch configuration
5. **Updated middleware** - Using Next.js 15 best practices
6. **Created proper auth utilities** - Added `useAuthHeaders()` hook
7. **Updated service functions** - Now accept headers as parameters
8. **Updated core components** - FeedContainer and usePresignedProfileImage

### Files Modified

#### Core Changes
- ✅ `client/src/axios/axios.ts` - Removed problematic interceptor
- ✅ `client/src/utils/getAxioHeader.ts` - Updated (needs proper client implementation)
- ✅ `client/src/hooks/useAuthHeaders.ts` - NEW FILE - Proper React hook
- ✅ `client/src/store/providers.tsx` - Optimized SessionProvider config
- ✅ `client/src/middleware.ts` - Updated to Next.js 15 pattern
- ✅ `client/auth.ts` - Removed console.log

#### Services Updated
- ✅ `client/src/services/api/notification.service.ts` - Fixed invalid useSession()
- ✅ `client/src/services/api/auth.service.ts` - Accept headers as parameters
- ✅ `client/src/services/api/feed.service.ts` - Accept headers as parameters

#### Components Updated
- ✅ `client/src/components/feed/feedEditor/FeedContainer.tsx` - Uses useAuthHeaders()
- ✅ `client/src/customHooks/usePresignedProfileImage.ts` - Uses useAuthHeaders()

### Documentation Created
- ✅ `client/NEXTAUTH_REFACTOR_GUIDE.md` - Comprehensive guide
- ✅ `client/REFACTOR_SUMMARY.md` - This file

---

## ⚠️ Remaining Work

### Components That Need Updates

The following components use the old auth patterns and need to be updated to use the new `useAuthHeaders()` hook:

#### 1. Client Components Using Services

**Files to update:**
- `client/src/components/layouts/NavBar.tsx` - Uses auth service calls
- `client/src/components/feed/feedEditor/CreatePostModal.tsx` - Uses auth service
- `client/src/customHooks/useNotifications.ts` - Needs proper auth headers
- `client/src/customHooks/useFollowerInfo.ts` - Uses auth
- `client/src/app/(main)/notification/page.tsx` - Needs auth

**Pattern to follow:**
```typescript
"use client";

import { useAuthHeaders } from "@/src/hooks/useAuthHeaders";

function MyComponent() {
  const authHeaders = useAuthHeaders();
  
  // Pass authHeaders to service functions
  const data = await myServiceFunction(params, authHeaders);
}
```

#### 2. Service Functions That Need Updates

Search for remaining service files that call `authHeaders()` internally:

```bash
# Find all files importing authHeaders
grep -r "authHeaders" client/src/services/
```

**Files to check:**
- `client/src/services/api/admin.service.ts`
- `client/src/services/api/follow.service.ts`
- Any other service files

**Update pattern:**
```typescript
// Before
export const someFunction = async () => {
  const headers = await authHeaders();
  return await axiosInstance.get('/endpoint', { headers });
};

// After
export const someFunction = async (headers: Record<string, string>) => {
  return await axiosInstance.get('/endpoint', { headers });
};
```

#### 3. Update Service Callers

After updating service functions, update components that call them:

```typescript
// Before (in component)
const result = await someServiceFunction();

// After (in component)
const authHeaders = useAuthHeaders();
const result = await someServiceFunction(authHeaders);
```

---

## 🔄 Migration Steps for Remaining Files

### Step 1: Identify Files Using Old Pattern
```bash
cd client
grep -r "authHeaders()" src/
grep -r "getSession()" src/
```

### Step 2: Update Service Functions
For each service file:
1. Add `headers: Record<string, string>` parameter to functions
2. Remove any internal `authHeaders()` calls
3. Pass headers to axios calls

### Step 3: Update Components
For each component:
1. Import `useAuthHeaders` hook
2. Call the hook to get headers
3. Pass headers to service functions

### Step 4: Test
1. Run `npm run dev`
2. Check Network tab - should see far fewer session calls
3. Verify authentication still works
4. Check for console errors

---

## 📊 Performance Improvements Expected

### Before
- 800+ `/api/auth/session` calls on page load
- Slow initial page render
- Race conditions
- Potential crashes from invalid hook usage

### After
- Minimal session calls (only when needed)
- Fast page loads
- Proper error handling
- Type-safe authentication

---

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Sign in works
- [ ] Sign out works  
- [ ] Protected routes redirect properly
- [ ] Token refresh works automatically
- [ ] Session expiry handled properly

### API Calls
- [ ] All authenticated endpoints work
- [ ] Headers passed correctly
- [ ] No excessive session calls
- [ ] Error handling works

### Components
- [ ] NavBar displays user data
- [ ] Profile picture loads
- [ ] Feed loads with authentication
- [ ] Notifications work
- [ ] Follow/unfollow works

---

## 🎯 Key Patterns to Follow

### ✅ DO This

#### Client Component Pattern
```typescript
"use client";

import { useSession } from "next-auth/react";
import { useAuthHeaders } from "@/src/hooks/useAuthHeaders";
import { myService } from "@/src/services/api/my.service";

export function MyComponent() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  
  const fetchData = async () => {
    if (!authHeaders.Authorization) return;
    
    const result = await myService(data, authHeaders);
    // ...
  };
  
  return <div>...</div>;
}
```

#### Server Component Pattern
```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signIn");
  }
  
  // Use session in server component
  return <div>Hello {session.user.username}</div>;
}
```

#### Service Function Pattern
```typescript
export const myService = async (
  data: any,
  headers: Record<string, string>
) => {
  const response = await axiosInstance.post("/endpoint", data, { headers });
  return response.data;
};
```

### ❌ DON'T Do This

```typescript
// ❌ Don't call hooks in utilities
export async function utility() {
  const session = await getSession();
}

// ❌ Don't use getSession() in interceptors
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession(); // EXCESSIVE CALLS!
});

// ❌ Don't mix client/server patterns
"use server";
export async function action() {
  const session = await getSession(); // Wrong! Use auth()
}
```

---

## 📚 References

- [NextAuth v5 Docs](https://next-auth.js.org/)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Refactor Guide](./NEXTAUTH_REFACTOR_GUIDE.md)

---

## 💡 Tips

1. **Always use `auth()` in server components/actions**
2. **Always use `useAuthHeaders()` in client components**
3. **Pass headers explicitly to service functions**
4. **Never call `getSession()` in request interceptors**
5. **Never use React hooks in utility functions**

---

## 🚀 Next Steps

1. Review this summary
2. Review [NEXTAUTH_REFACTOR_GUIDE.md](./NEXTAUTH_REFACTOR_GUIDE.md)
3. Update remaining components following the patterns
4. Test thoroughly
5. Deploy to staging environment
6. Monitor session API calls

---

**Questions?** Refer to the comprehensive guide in `NEXTAUTH_REFACTOR_GUIDE.md`

