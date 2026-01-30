"use client";

import React, { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";
import { API_ROUTES } from "@/src/constants/api.routes"; // Assuming sonner is used for toasts, or react-hot-toast
import { queryKeys } from "@/src/lib/queryKeys";

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // If editing
  username: string;
}

export default function ExperienceModal({ isOpen, onClose, initialData, username }: ExperienceModalProps) {
  const queryClient = useQueryClient();
  const initialFormState = {
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };

  const [formData, setFormData] = useState(initialData ? {
    title: initialData.title || "",
    company: initialData.company || "",
    location: initialData.location || "",
    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
    current: initialData?.current || false,
    description: initialData?.description || "",
  } : initialFormState);

   // Update formData when initialData changes
   React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        company: initialData.company || "",
        location: initialData.location || "",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
        current: initialData?.current || false,
        description: initialData?.description || "",
      });
    } else {
        setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (initialData?.id) {
        // Update logic (if implemented)
        // return api.put(`/users/experience/${initialData.id}`, data);
        // For now, let's assume update is delete + add or just not supported yet as per backend tasks which were add/delete
        throw new Error("Update not fully implemented");
      } else {
        return api.post(API_ROUTES.USERS.EXPERIENCE, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(username) });
      toast.success("Experience added successfully");
      setFormData(initialFormState);
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
    
    // Convert dates to ISO if needed, or backend accepts YYYY-MM-DD? 
    // Typescript DTO said string (ISO date string).
    // Let's ensure startDate is ISO format.
    
    const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };
    
    mutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Experience" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Senior Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Google"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Mountain View, CA"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              disabled={formData.current}
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center">
            <input
                type="checkbox"
                name="current"
                id="current"
                checked={formData.current}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="current" className="ml-2 block text-sm text-gray-900">
                I am currently working in this role
            </label>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your responsibilities and achievements..."
            />
        </div>

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
