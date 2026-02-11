"use client";
import { useState, useEffect } from "react";
import { PostCreationProvider } from "@/src/contexts/PostCreationContext";
import dynamic from "next/dynamic";
import { Image, FileText, Video } from "lucide-react";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { useSession } from "next-auth/react";
import { Card } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

const LazyCreatePostModal = dynamic(() => import("./CreatePostModal"), {
  ssr: false,
});

interface PostComposerProps {
  userId: string;
}

export default function PostComposer({ userId }: PostComposerProps) {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const { data: session } = useSession();
  const profileImage = session?.user?.image;
  const [imageSrc, setImageSrc] = useState(PROFILE_DEFAULT_URL);

  useEffect(() => {
    if (profileImage) {
      setImageSrc(profileImage);
    }
  }, [profileImage]);

  return (
    <PostCreationProvider>
      <Card className="border-none shadow-sm overflow-hidden mb-2">
         <div className="p-3 flex gap-4">
             <Avatar className="h-12 w-12 border border-border cursor-pointer">
                  <AvatarImage 
                    src={imageSrc} 
                    alt="Profile" 
                    onError={() => setImageSrc(PROFILE_DEFAULT_URL)}
                  />
                  <AvatarFallback>U</AvatarFallback>
             </Avatar>
             <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex-1 text-left px-4 py-3 bg-muted/50 hover:bg-muted rounded-full border border-input text-muted-foreground font-medium transition-colors cursor-pointer text-sm"
              >
                Start a post...
              </button>
         </div>
         <div className="flex items-center justify-between px-4 pb-2 sm:px-12 sm:pb-3">
             <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer group"
            >
              <Image size={20} className="text-blue-500 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm group-hover:text-foreground">Media</span>
            </button>
            <button
               onClick={() => setIsCreatePostModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer group"
            >
              <Video size={20} className="text-orange-600 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm group-hover:text-foreground">Video</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer group"
            >
              <FileText size={20} className="text-orange-400 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm group-hover:text-foreground">Article</span>
            </button>
         </div>
        {isCreatePostModalOpen && (
          <LazyCreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
          />
        )}
      </Card>
    </PostCreationProvider>
  );
}
