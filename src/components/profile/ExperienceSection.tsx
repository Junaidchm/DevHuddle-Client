import React from 'react';
import { Experience } from '@/src/types/user.type';
import { format } from 'date-fns';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/lib/api-client';
import ExperienceModal from './modals/ExperienceModal';
import { API_ROUTES } from '@/src/constants/api.routes';
import { queryKeys } from '@/src/lib/queryKeys';

interface ExperienceSectionProps {
  experience: Experience[];
  isOwnProfile: boolean;
  username: string;
}

const ExperienceSection = ({ experience, isOwnProfile, username }: ExperienceSectionProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingExperience, setEditingExperience] = React.useState<Experience | undefined>(undefined);
  const queryClient = useQueryClient();

  // Import locally to avoid top-level issues if needed, or just standard import
  // But wait, I need to add imports at the top first.
  // I will use a separate replacement for imports.

  const handleAdd = () => {
    setEditingExperience(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
        try {
            await api.delete(API_ROUTES.USERS.EXPERIENCE_BY_ID(id));
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(username) });
            // toast.success("Experience deleted"); // If toast is available
        } catch (error) {
            console.error("Failed to delete", error);
            // toast.error("Failed to delete");
        }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Experience</h2>
          {isOwnProfile && (
            <div className="flex gap-2">
              <button 
                onClick={handleAdd}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                title="Add experience"
              >
                <Plus size={24} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {experience.length === 0 ? (
            <p className="text-gray-500 italic">No experience added yet.</p>
          ) : (
            experience.map((exp) => (
              <div key={exp.id} className="flex gap-4 group relative">
                <div className="flex-shrink-0 mt-1">
                  {exp.logoUrl ? (
                     <div className="w-12 h-12 relative rounded-md overflow-hidden border border-gray-100">
                        <Image 
                          src={exp.logoUrl} 
                          alt={exp.company} 
                          fill 
                          className="object-contain"
                        />
                     </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      <Building2 size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:underline cursor-pointer">
                            {exp.title}
                        </h3>
                        <p className="text-gray-900 text-sm">{exp.company}</p>
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(exp)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(exp.id)}
                                className="p-1 hover:bg-gray-100 rounded-full text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      )}
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-0.5">
                    {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.current ? 'Present' : (exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : 'Present')}
                  </p>
                  {exp.location && (
                      <p className="text-gray-500 text-sm mt-0.5">{exp.location}</p>
                  )}
                  
                  {exp.description && (
                    <p className="text-gray-700 text-sm mt-3 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {isOwnProfile && (
        <ExperienceModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            initialData={editingExperience}
            username={username}
        />
      )}
    </>
  );
};

export default ExperienceSection;
