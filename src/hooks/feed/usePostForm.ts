import { usePostCreation } from "@/src/contexts/PostCreationContext";

/**
 * Hook to access Post Creation Form State.
 * Acts as a Facade for the Context.
 */
export const usePostForm = () => {
    return usePostCreation();
};
