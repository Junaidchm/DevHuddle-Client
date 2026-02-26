import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { 
  getProjectComments, 
  getProjectReplies, 
  createProjectComment, 
  updateProjectComment, 
  deleteProjectComment,
  likeProjectComment,
  unlikeProjectComment,
  ProjectComment
} from "../services/api/project.service";
import { useAuthHeaders } from "./useAuthHeaders";
import { useToast } from "@/src/components/ui/use-toast";

export const useProjectComments = (projectId: string) => {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.projects.comments.all(projectId),
    queryFn: () => getProjectComments(projectId, authHeaders),
    enabled: !!projectId && !!authHeaders,
  });
};

export const useProjectReplies = (commentId: string) => {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.projects.comments.replies(commentId),
    queryFn: () => getProjectReplies(commentId, authHeaders),
    enabled: !!commentId && !!authHeaders,
  });
};

export const useCreateProjectComment = () => {
  const qc = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      projectId, 
      content, 
      parentCommentId 
    }: { 
      projectId: string; 
      content: string; 
      parentCommentId?: string;
    }) => createProjectComment(projectId, content, authHeaders, parentCommentId),
    
    onSuccess: (newComment, variables) => {
      if (variables.parentCommentId) {
        qc.invalidateQueries({ queryKey: queryKeys.projects.comments.replies(variables.parentCommentId) });
        // Also invalidate the parent comment list so reply count updates
        qc.invalidateQueries({ queryKey: queryKeys.projects.comments.all(variables.projectId) });
      } else {
        qc.invalidateQueries({ queryKey: queryKeys.projects.comments.all(variables.projectId) });
      }
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.comments.count(variables.projectId) });
      
      toast({
        title: "Comment posted",
        description: "Your comment has been successfully shared.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateProjectComment = () => {
  const qc = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      commentId, 
      content 
    }: { 
      commentId: string; 
      content: string; 
    }) => updateProjectComment(commentId, content, authHeaders),
    
    onSuccess: (updatedComment) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.comments.all(updatedComment.projectId) });
      if (updatedComment.parentCommentId) {
        qc.invalidateQueries({ queryKey: queryKeys.projects.comments.replies(updatedComment.parentCommentId) });
      }
      
      toast({
        title: "Comment updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteProjectComment = () => {
  const qc = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      commentId,
      projectId,
      parentCommentId
    }: { 
      commentId: string;
      projectId: string;
      parentCommentId?: string;
    }) => deleteProjectComment(commentId, authHeaders),
    
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.comments.all(variables.projectId) });
      if (variables.parentCommentId) {
        qc.invalidateQueries({ queryKey: queryKeys.projects.comments.replies(variables.parentCommentId) });
      }
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.comments.count(variables.projectId) });

      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  });
};

export const useProjectCommentLikeMutation = () => {
  const qc = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      commentId,
      projectId,
      isLiked,
      parentCommentId,
    }: {
      commentId: string;
      projectId: string;
      isLiked: boolean;
      parentCommentId?: string;
    }) => {
      if (isLiked) {
        return unlikeProjectComment(commentId, authHeaders);
      } else {
        return likeProjectComment(commentId, authHeaders);
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.comments.all(variables.projectId) });
      if (variables.parentCommentId) {
        qc.invalidateQueries({ queryKey: queryKeys.projects.comments.replies(variables.parentCommentId) });
      }
    },
  });
};
