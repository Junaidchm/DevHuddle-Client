

import {
  FeedResponse,
  NewPost,
  Post,
  PostsPage,
  submitPostProp,
} from "@/src/app/types/feed";
import { AudienceType, CommentControl } from "@/src/contexts/MediaContext";
import { submitPost } from "../feedEditor/actions/submitPost";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";


export function anotheruseSubmitPostMutation({
  setShowSuccess,
  setError,
  setIsPosting,
  setPostContent,
  setSelectedMedia,
  setPoll,
  setAudienceType,
  setCommentControl,
  onClose,
}: {
  setShowSuccess: (value: boolean) => void;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setIsPosting: (value: boolean) => void;
  setPostContent: (value: string) => void;
  setSelectedMedia: (value: any[]) => void;
  setPoll: (value: any | null) => void;
  setAudienceType: (value: AudienceType) => void;
  setCommentControl: (value: CommentControl) => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // ✅ BUG FIX: Transform NewPost to submitPost input format
    mutationFn: async (newPost: NewPost) => {
      // Extract only the fields needed for submitPost
      return await submitPost({
        content: newPost.content,
        mediaIds: newPost.mediaIds || [],
        visibility: newPost.visibility || "PUBLIC",
        commentControl: newPost.commentControl || "ANYONE",
      });
    },
    retry: 1,
    onMutate: async (newPost: NewPost) => {
     
     
      const queryFilter: QueryFilters = { queryKey: ["post-feed", "for-you"] };
      const feedKey = ["post-feed", "for-you"];

      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries(queryFilter);

      // Snapshot previous data for rollback
      const previousData =
        queryClient.getQueryData<InfiniteData<PostsPage, string | null>>(
          feedKey
        ); 

      // Optimistically update the cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      // Return context for rollback
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // ✅ BUG FIX: Use correct query key that matches feed query
      const feedKey = ["post-feed", "for-you"];
      if (context?.previousData) {
        queryClient.setQueryData(feedKey, context.previousData);
      }
      // ✅ FIXED P0-11: Removed console.error, use proper error handling
      setIsPosting(false);
      
      // Handle structured error responses
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error(error.message as string || "Failed to post. Please try again.");
      } else {
        toast.error("Failed to post. Please try again.");
      }
    },
    onSuccess: (result) => {
      // ✅ BUG FIX: Handle structured response from submitPost
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          // Server returned error
          setIsPosting(false);
          const errorMessage = result.message || result.error || "Failed to create post";
          toast.error(errorMessage);
          
          // Handle validation errors
          if (result.errors) {
            const errorMessages = Object.values(result.errors)
              .flat()
              .filter(Boolean)
              .join(", ");
            if (errorMessages) {
              toast.error(`Validation error: ${errorMessages}`);
            }
          }
          return;
        }
      }

      // ✅ BUG FIX: Use correct query key that matches feed query
      const feedKey = ["post-feed", "for-you"];
     
      // ✅ BUG FIX: Always invalidate and refetch feed after successful post creation
      // This ensures new post appears on reload
      queryClient.invalidateQueries({
        queryKey: feedKey,
      });

      // Show success and reset UI
      setShowSuccess(true);
      toast.success("Post created successfully!");
      
      // Reset UI state
      setShowSuccess(false);
      onClose();
      setPostContent("");
      setSelectedMedia([]);
      setPoll(null);
      setAudienceType(AudienceType.PUBLIC);
      setCommentControl(CommentControl.ANYONE);
      setIsPosting(false);
    },
  });

  return mutation;
}
