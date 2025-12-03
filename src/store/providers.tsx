"use client";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistGate } from "redux-persist/integration/react";
import { useState } from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "../app/api/uploadthing/core";
import { SessionProvider } from "next-auth/react";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { WebSocketProvider } from "../contexts/WebSocketContext";

import { createQueryClient } from "@/src/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  // ⚡ Important: keep QueryClient stable across renders with production defaults
  const [queryClient] = useState(() => createQueryClient());
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider
          refetchInterval={5 * 60} // Refetch session every 5 minutes (only if page is active)
          refetchOnWindowFocus={false} // Don't refetch on every tab focus
          refetchWhenOffline={false} // Don't refetch when offline
        >
          <SessionProviderWrapper>
            <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
            <QueryClientProvider client={queryClient}>
              <WebSocketProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
              </WebSocketProvider>
            </QueryClientProvider>
          </SessionProviderWrapper>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
