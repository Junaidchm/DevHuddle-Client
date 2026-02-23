'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewPost } from "@/src/app/types/feed";
import { formatRelativeDate } from "@/src/utils/formateRelativeDate";
import { getMediaUrl } from "@/src/utils/media";
import { Heart, MessageCircle } from 'lucide-react';
import { Card } from "@/src/components/ui/card";

interface ProfilePostPreviewCardProps {
  post: NewPost;
}

const ProfilePostPreviewCard = ({ post }: ProfilePostPreviewCardProps) => {
  // Get first media item for thumbnail if available
  const firstMedia = post.attachments && post.attachments.length > 0 ? post.attachments[0] : null;
  const isVideo = firstMedia?.type === 'VIDEO';

  return (
    <Card className="border-b border-border shadow-none rounded-none first:rounded-t-lg last:rounded-b-lg last:border-0 hover:bg-muted/50 transition-colors">
      <Link href={`/feed/${post.id}`} className="block p-4">
        <div className="flex gap-4">
            
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Header: Author & Time (Minimal) */}
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-foreground mr-1">
                {post.user?.name}
              </span> 
              posted this • {formatRelativeDate(new Date(post.createdAt))}
            </div>

            {/* Post Content Preview */}
            <p className="text-sm text-foreground line-clamp-2 mb-2 leading-relaxed">
              {post.content}
            </p>

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{post.engagement?.likesCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.engagement?.commentsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Thumbnail (Right side, if media exists) */}
          {firstMedia && (
            <div className="shrink-0 w-20 h-20 relative rounded-md overflow-hidden bg-muted border border-border/50">
               {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/5">
                        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-white ml-0.5" />
                        </div>
                    </div>
               ) : (
                <Image
                    src={getMediaUrl(firstMedia.url)}
                    alt="Post thumbnail"
                    fill
                    className="object-cover"
                />
               )}
            </div>
          )}

        </div>
      </Link>
    </Card>
  );
};

export default ProfilePostPreviewCard;
