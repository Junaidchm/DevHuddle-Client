"use client";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import {
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistGate } from "redux-persist/integration/react";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { WebSocketProvider } from "../contexts/WebSocketContext";
import { VideoCallProvider } from "../contexts/VideoCallContext";
import { CallModal } from "../components/chat/call/CallModal";

import { createQueryClient } from "@/src/lib/query-client";

import { Session } from "next-auth";

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  // ⚡ Important: keep QueryClient stable across renders with production defaults
  const [queryClient] = useState(() => createQueryClient());
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider
          session={session}
          refetchInterval={4 * 60} // ✅ FIXED: Refetch session every 4 minutes (token expires in 15 min, refresh at 5 min buffer)
          refetchOnWindowFocus={true} // ✅ FIXED: Refetch when user returns to tab (helps catch expired sessions)
          refetchWhenOffline={false} // Don't refetch when offline
        >
          <SessionProviderWrapper>
            <QueryClientProvider client={queryClient}>
              <WebSocketProvider>
                <VideoCallProvider>
                  {children}
                  <CallModal />
                  <ReactQueryDevtools initialIsOpen={false} />
                </VideoCallProvider>
              </WebSocketProvider>
            </QueryClientProvider>
          </SessionProviderWrapper>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
