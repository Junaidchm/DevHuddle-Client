"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, CreateProjectData } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      return await createProject(data, authHeaders);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "trending"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "top"] });
      toast.success("Project created successfully!");
      router.push(`/projects/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}

