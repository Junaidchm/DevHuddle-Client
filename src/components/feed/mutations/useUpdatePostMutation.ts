
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "../feedEditor/actions/updatePost";
import { queryKeys } from "@/src/lib/queryKeys";

interface UpdatePostPayload {
  id: string;
  content?: string;
  addAttachmentIds?: string[];
  removeAttachmentIds?: string[];
  visibility?: string;
  commentControl?: string;
  mediaTags?: any[];
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePostPayload) => {
      const result = await updatePost(payload.id, {
        content: payload.content,
        addAttachmentIds: payload.addAttachmentIds,
        removeAttachmentIds: payload.removeAttachmentIds,
        visibility: payload.visibility,
        commentControl: payload.commentControl,
        mediaTags: payload.mediaTags,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update post");
      }
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate feed and specific post queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed.all,
      });
      // Also invalidate the specific post if it uses a detail query
      // queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
    },
  });
}
