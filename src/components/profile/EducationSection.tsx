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
import { Card } from '../ui/card';
import { Button } from '../ui/button';

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
      <Card className="p-6 mb-4 shadow-sm border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Education</h2>
          {isOwnProfile && (
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                size="icon"
                onClick={handleAdd}
                className="hover:bg-muted rounded-full w-10 h-10" 
                title="Add education"
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {education.length === 0 ? (
             <p className="text-muted-foreground italic">No education details added yet.</p>
          ) : (
            education.map((edu) => (
              <div key={edu.id} className="flex gap-4 group relative">
                <div className="flex-shrink-0 mt-1">
                  {edu.logoUrl ? (
                     <div className="w-12 h-12 relative rounded-md overflow-hidden border border-border bg-white">
                        <Image 
                          src={edu.logoUrl} 
                          alt={edu.school} 
                          fill 
                          className="object-contain p-1"
                        />
                     </div>
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 pb-6 border-b border-border last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:underline cursor-pointer">
                            {edu.school}
                        </h3>
                        <p className="text-foreground text-sm font-medium">
                            {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                        </p>
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(edu)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(edu.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                      )}
                  </div>

                  <p className="text-muted-foreground text-sm mt-0.5">
                    {format(new Date(edu.startDate), 'yyyy')} - {edu.endDate ? format(new Date(edu.endDate), 'yyyy') : 'Present'}
                  </p>
                  
                  {edu.grade && (
                      <p className="text-muted-foreground text-sm mt-1">Grade: {edu.grade}</p>
                  )}
                  
                  {edu.activities && (
                      <p className="text-muted-foreground text-sm mt-2">Activities: {edu.activities}</p>
                  )}
  
                  {edu.description && (
                    <p className="text-foreground text-sm mt-3 whitespace-pre-wrap leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
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
