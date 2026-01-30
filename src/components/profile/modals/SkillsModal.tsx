"use client";

import React, { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import SkillsInput from "@/src/components/profile/SkillsInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";
import { API_ROUTES } from "@/src/constants/api.routes";
import { queryKeys } from "@/src/lib/queryKeys";

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSkills: string[];
  username: string;
}

export default function SkillsModal({ isOpen, onClose, initialSkills, username }: SkillsModalProps) {
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when initialSkills changes or modal opens
  React.useEffect(() => {
    if (initialSkills && isOpen) {
        setSkills(initialSkills);
    }
  }, [initialSkills, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: { skills: string[] }) => {
       return api.put(API_ROUTES.USERS.SKILLS, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(username) });
      toast.success("Skills updated successfully");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
    onSettled: () => {
        setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    mutation.mutate({ skills });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Skills" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <SkillsInput 
            value={skills} 
            onChange={setSkills} 
            maxSkills={30}
        />

        <div className="flex justify-end gap-3 mt-6">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Saving..." : "Save"}
            </button>
        </div>
      </form>
    </Modal>
  );
}
