"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useGetPostLikes } from "../queries/useGetPostLikes";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const LikesModal: React.FC<LikesModalProps> = ({ isOpen, onClose, postId }) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPostLikes(postId);

  const likes = data?.pages.flatMap((page) => page.data.users) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">Likes</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load likes.
            </div>
          ) : likes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No likes yet.
            </div>
          ) : (
            <div className="space-y-4">
              {likes.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </div>
              ))}

              {hasNextPage && (
                <div className="pt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-primary hover:text-primary-hover"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikesModal;
