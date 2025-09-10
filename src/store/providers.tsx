"use client"
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { QueryClient, QueryClientProvider,HydrationBoundary } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistGate } from "redux-persist/integration/react";
import { useState } from "react";


// const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {

    // ⚡ Important: keep QueryClient stable across renders
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
         
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
