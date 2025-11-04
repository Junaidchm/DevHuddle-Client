"use client";

import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  );
}