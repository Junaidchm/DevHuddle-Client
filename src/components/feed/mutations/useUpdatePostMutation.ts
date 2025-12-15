
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "../feedEditor/actions/updatePost";
import { queryKeys } from "@/src/lib/queryKeys";

interface UpdatePostPayload {
  id: string;
  content?: string;
  addAttachmentIds?: string[];
  removeAttachmentIds?: string[];
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePostPayload) => {
      const result = await updatePost(payload.id, {
        content: payload.content,
        addAttachmentIds: payload.addAttachmentIds,
        removeAttachmentIds: payload.removeAttachmentIds,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update post");
      }
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate feed and specific post queries
      queryClient.invalidateQueries({
        queryKey: ["post-feed", "for-you"],
      });
      // Also invalidate the specific post if it uses a detail query
      // queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
    },
  });
}
