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
import { Card } from '../ui/card';
import { Button } from '../ui/button';

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
      <Card className="p-6 mb-4 shadow-sm border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Experience</h2>
          {isOwnProfile && (
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                size="icon"
                onClick={handleAdd}
                className="hover:bg-muted rounded-full w-10 h-10" 
                title="Add experience"
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {experience.length === 0 ? (
            <p className="text-muted-foreground italic">No experience added yet.</p>
          ) : (
            experience.map((exp) => (
              <div key={exp.id} className="flex gap-4 group relative">
                <div className="flex-shrink-0 mt-1">
                  {exp.logoUrl ? (
                     <div className="w-12 h-12 relative rounded-md overflow-hidden border border-border bg-white">
                        <Image 
                          src={exp.logoUrl} 
                          alt={exp.company} 
                          fill 
                          className="object-contain p-1"
                        />
                     </div>
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 pb-6 border-b border-border last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:underline cursor-pointer">
                            {exp.title}
                        </h3>
                        <p className="text-foreground text-sm font-medium">{exp.company}</p>
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(exp)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(exp.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                      )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.current ? 'Present' : (exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : 'Present')}
                  </p>
                  {exp.location && (
                      <p className="text-muted-foreground text-sm mt-0.5">{exp.location}</p>
                  )}
                  
                  {exp.description && (
                    <p className="text-foreground text-sm mt-3 whitespace-pre-wrap leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
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
