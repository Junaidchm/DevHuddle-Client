# Quick Reference: NextAuth Authentication Patterns

## 🚀 Client Components (Use This)

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useAuthHeaders } from "@/src/hooks/useAuthHeaders";
import { myService } from "@/src/services/api/my.service";

function MyComponent() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  
  const fetchData = async () => {
    if (!authHeaders.Authorization) {
      // Handle unauthenticated state
      return;
    }
    
    const result = await myService(params, authHeaders);
    // Use result...
  };
  
  return <div>...</div>;
}
```

## 🖥️ Server Components (Use This)

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signIn");
  }
  
  return <div>Hello {session.user.username}</div>;
}
```

## 🔧 Service Functions (Write Like This)

```typescript
export const myService = async (
  data: any,
  headers: Record<string, string>
) => {
  return await axiosInstance.post("/endpoint", data, { headers });
};
```

## ❌ Common Mistakes to Avoid

### 1. Don't use useSession() in utilities
```typescript
// ❌ WRONG
export function utility() {
  const { data: session } = useSession(); // CRASH!
}

// ✅ CORRECT - Only in components
function MyComponent() {
  const { data: session } = useSession(); // OK!
}
```

### 2. Don't use getSession() in interceptors
```typescript
// ❌ WRONG - Causes 800+ session calls
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  // ...
});

// ✅ CORRECT - Pass headers explicitly
const authHeaders = useAuthHeaders();
await axiosInstance.get('/endpoint', { headers: authHeaders });
```

### 3. Don't call getSession() in server components
```typescript
// ❌ WRONG
export default async function Page() {
  const session = await getSession();
}

// ✅ CORRECT
import { auth } from "@/auth";
export default async function Page() {
  const session = await auth();
}
```

## 📝 File Patterns

### Client Component
```typescript
"use client";
import { useAuthHeaders } from "@/src/hooks/useAuthHeaders";

export function MyComponent() {
  const authHeaders = useAuthHeaders();
  // Use authHeaders...
}
```

### Server Component/Action
```typescript
import { auth } from "@/auth";

export async function MyServerAction() {
  const session = await auth();
  // Use session...
}
```

### Service Function
```typescript
import { axiosInstance } from "@/src/axios/axios";

export const myService = async (
  params: any,
  headers: Record<string, string>
) => {
  return await axiosInstance.post("/endpoint", params, { headers });
};
```

## 🎯 Summary

- **Client**: Use `useAuthHeaders()` hook
- **Server**: Use `auth()` function  
- **Services**: Accept `headers` as parameter
- **Never**: Call hooks in utilities or interceptors

