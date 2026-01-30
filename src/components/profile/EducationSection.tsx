import React from 'react';
import { Education } from '@/src/types/user.type';
import { format } from 'date-fns';

import Image from 'next/image';

interface EducationSectionProps {
  education: Education[];
  isOwnProfile: boolean;
  username: string;
}

import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api-client';
import EducationModal from './modals/EducationModal';
import { API_ROUTES } from '@/src/constants/api.routes';
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { queryKeys } from '@/src/lib/queryKeys';

const EducationSection = ({ education, isOwnProfile, username }: EducationSectionProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEducation, setEditingEducation] = React.useState<Education | undefined>(undefined);
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingEducation(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (edu: Education) => {
    setEditingEducation(edu);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this education?")) {
        try {
            await api.delete(API_ROUTES.USERS.EDUCATION_BY_ID(id));
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(username) });
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          {isOwnProfile && (
            <div className="flex gap-2">
              <button 
                onClick={handleAdd}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                title="Add education"
              >
                <Plus size={24} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {education.length === 0 ? (
             <p className="text-gray-500 italic">No education details added yet.</p>
          ) : (
            education.map((edu) => (
              <div key={edu.id} className="flex gap-4 group relative">
                <div className="flex-shrink-0 mt-1">
                  {edu.logoUrl ? (
                     <div className="w-12 h-12 relative rounded-md overflow-hidden border border-gray-100">
                        <Image 
                          src={edu.logoUrl} 
                          alt={edu.school} 
                          fill 
                          className="object-contain"
                        />
                     </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      <GraduationCap size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:underline cursor-pointer">
                            {edu.school}
                        </h3>
                        <p className="text-gray-900 text-sm">
                            {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                        </p>
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(edu)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(edu.id)}
                                className="p-1 hover:bg-gray-100 rounded-full text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      )}
                  </div>

                  <p className="text-gray-500 text-sm mt-0.5">
                    {format(new Date(edu.startDate), 'yyyy')} - {edu.endDate ? format(new Date(edu.endDate), 'yyyy') : 'Present'}
                  </p>
                  
                  {edu.grade && (
                      <p className="text-gray-600 text-sm mt-1">Grade: {edu.grade}</p>
                  )}
                  
                  {edu.activities && (
                      <p className="text-gray-600 text-sm mt-2">Activities and societies: {edu.activities}</p>
                  )}
  
                  {edu.description && (
                    <p className="text-gray-700 text-sm mt-3 whitespace-pre-wrap">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {isOwnProfile && (
        <EducationModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            initialData={editingEducation}
            username={username}
        />
      )}
    </>
  );
};

export default EducationSection;
