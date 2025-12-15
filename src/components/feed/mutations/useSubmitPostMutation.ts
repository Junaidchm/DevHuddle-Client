
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitPost } from "../feedEditor/actions/submitPost";
import { queryKeys } from "@/src/lib/queryKeys";
import { AudienceType, CommentControl } from "@/src/contexts/PostCreationContext";

interface CreatePostPayload {
  content: string;
  mediaIds: string[];
  visibility: AudienceType;
  commentControl: CommentControl;
}

export function useSubmitPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const result = await submitPost(payload);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create post");
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate feed query to show new post
      // Using array for feed key as it might be used elsewhere without the object const
      // TODO: Centralize feed keys if not already done, but for now matching existing pattern
      queryClient.invalidateQueries({
        queryKey: ["post-feed", "for-you"],
      });
    },
  });
}
