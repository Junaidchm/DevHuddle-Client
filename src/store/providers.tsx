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

// const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // ⚡ Important: keep QueryClient stable across renders
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider>
          <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
