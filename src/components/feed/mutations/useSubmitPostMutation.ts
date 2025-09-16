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
    mutationFn: submitPost,
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

      console.log(
        "this is the previous data .......................==============================",
        previousData,
        'and this is the new profile image url ------------------------------', newPost.user?.avatar
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
      // Rollback to previous data
      const feedKey = ["feed", "for-you"];
      if (context?.previousData) {
        queryClient.setQueryData(feedKey, context.previousData);
      }
      console.error("Post creation error:", error);
     
      setIsPosting(false);
      toast.error("Failed to post. Please try again.");
    },
    onSuccess: () => {
     
      const feedKey = ["feed", "for-you"];
     
      queryClient.invalidateQueries({
        queryKey: feedKey,
        predicate: (query) => !query.state.data, // Only fetch empty queries
      });

      // Show success and reset UI
      setShowSuccess(true);
      toast.success("Post created");
      // setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setPostContent("");
        setSelectedMedia([]);
        setPoll(null);
        setAudienceType(AudienceType.PUBLIC);
        setCommentControl(CommentControl.ANYONE);
      // }, 2000);
    },
  });

  return mutation;
}
