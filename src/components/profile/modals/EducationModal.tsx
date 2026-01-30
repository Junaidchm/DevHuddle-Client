"use client";

import React, { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api-client";
import { toast } from "sonner";
import { API_ROUTES } from "@/src/constants/api.routes";
import { queryKeys } from "@/src/lib/queryKeys";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  username: string;
}

const DEGREES = [
  "High School Diploma", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctorate", "Professional Degree", "Other"
];

const FIELDS_OF_STUDY = [
  "Computer Science", "Business Administration", "Psychology", "Nursing", "Biology", "Engineering", "Education", "Communications", "Economics", "Arts", "Other"
];

export default function EducationModal({ isOpen, onClose, initialData, username }: EducationModalProps) {
  const queryClient = useQueryClient();
  
  const initialFormState = {
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    grade: "",
    activities: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialData ? {
    school: initialData.school || "",
    degree: initialData.degree || "",
    fieldOfStudy: initialData.fieldOfStudy || "",
    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
    grade: initialData.grade || "",
    activities: initialData.activities || "",
    description: initialData.description || "",
  } : initialFormState);

  // Update formData when initialData changes (for editing)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        school: initialData.school || "",
        degree: initialData.degree || "",
        fieldOfStudy: initialData.fieldOfStudy || "",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
        grade: initialData.grade || "",
        activities: initialData.activities || "",
        description: initialData.description || "",
      });
    } else {
        setFormData(initialFormState);
    }
  }, [initialData, isOpen]); // Reset on open if no initialData

  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (initialData?.id) {
         // Update not fully implemented in backend yet
         throw new Error("Update not fully implemented");
      } else {
        return api.post(API_ROUTES.USERS.EDUCATION, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(username) });
      toast.success("Education added successfully");
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
    
    const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };
    
    mutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Education" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
            <input
              type="text"
              name="school"
              required
              value={formData.school}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Stanford University"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
            <select
              name="degree"
              required
              value={formData.degree}
              onChange={handleChange as any}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="">Select Degree</option>
                {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
            <select
              name="fieldOfStudy"
              required
              value={formData.fieldOfStudy}
              onChange={handleChange as any}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="">Select Field of Study</option>
                {FIELDS_OF_STUDY.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (or expected)</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 3.8 GPA"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activities and societies</label>
            <textarea
              name="activities"
              rows={2}
              value={formData.activities}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Volleyball team, Coding club"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your studies, awards, etc."
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
