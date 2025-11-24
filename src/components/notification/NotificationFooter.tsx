"use client";

import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

interface NotificationFooterProps {
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}

export const NotificationFooter = ({ fetchNextPage, hasNextPage, isFetchingNextPage }: NotificationFooterProps) => {
  return (
    <div className="flex justify-center p-4 border-t">
      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        variant="outline"
      >
        {isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isFetchingNextPage ? "Loading..." : hasNextPage ? "Load More" : "No more notifications"}
      </Button>
    </div>
  );
};