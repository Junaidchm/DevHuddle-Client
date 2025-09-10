
import { FeedResponse, Post } from "@/src/app/types/feed";
import { AudienceType, CommentControl} from "@/src/contexts/MediaContext";
import { submitPost } from "@/src/services/api/feed.service";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useSubmitPostMutation({
  userId,
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
  userId:string;
  setShowSuccess: (value: boolean) => void;
  setError:  React.Dispatch<React.SetStateAction<string>>
  setIsPosting: (value: boolean) => void;
  setPostContent: (value: string) => void;
  setSelectedMedia: (value: any[]) => void;
  setPoll: (value: any | null) => void;
  setAudienceType: (
      value: AudienceType
    ) => void;
  setCommentControl: (value:CommentControl)=> void;
  onClose: () => void;
}) {

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    retry: 1, // Retry once for flaky networks (recommended for social media)
    onMutate: async (newPost: Post) => {
      // Define query key for user's feed
      const feedKey = ['feed', { userId: userId }];

      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: feedKey });

      // Snapshot previous data for rollback
      const previousData = queryClient.getQueryData<InfiniteData<FeedResponse, string | null>>(feedKey);

      // Optimistically update the cache
      queryClient.setQueryData<InfiniteData<FeedResponse, string | null>>(feedKey, (oldData) => {
        if (!oldData) return oldData;
        const firstPage = oldData.pages[0];
        if (!firstPage) return oldData;
        return {
          pageParams: oldData.pageParams,
          pages: [
            {
              posts: [{ ...newPost, id: `temp-${Date.now()}` }, ...firstPage.posts], // Temp ID for optimism
              nextCursor: firstPage.nextCursor,
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

      // Return context for rollback
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous data
      const feedKey = ['feed', { userId: userId }];
      if (context?.previousData) {
        queryClient.setQueryData(feedKey, context.previousData);
      }
      console.error('Post creation error:', error); // Log for debugging
      setError('Failed to post. Please try again.');
      setTimeout(() => setError(""), 3000);
      setIsPosting(false);
      toast.error( "Failed to post. Please try again.");
    },
    onSuccess: (newPost) => {
      console.log('this onsuccess is getting called ..........................')
      // Update cache with real server data
      const feedKey = ['feed', { userId: userId}];
      queryClient.setQueryData<InfiniteData<FeedResponse, string | null>>(feedKey, (oldData) => {
        if (!oldData) return oldData;
        const firstPage = oldData.pages[0];
        if (!firstPage) return oldData;
        const actualPost = 'data' in newPost ? newPost.data : newPost;
        return {
          pageParams: oldData.pageParams,
          pages: [
            {
              posts: [
                actualPost as Post,
                ...firstPage.posts.filter((post) => post.id !== `temp-${Date.now()}`), // Remove temp post
              ],
              nextCursor: firstPage.nextCursor,
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

      // Invalidate queries without data for consistency
      queryClient.invalidateQueries({
        queryKey: feedKey,
        predicate: (query) => !query.state.data, // Only fetch empty queries
      });

      // Show success and reset UI
      setShowSuccess(true);
      toast.success( "Post created" );
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setPostContent('');
        setSelectedMedia([]);
        setPoll(null);
        setAudienceType(AudienceType.PUBLIC);
        setCommentControl(CommentControl.ANYONE);
      }, 2000);
    },
  });

  return mutation;
}