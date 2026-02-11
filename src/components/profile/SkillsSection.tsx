import React from 'react';
import { Pencil } from 'lucide-react';
import SkillsModal from './modals/SkillsModal';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface SkillsSectionProps {
  skills: string[];
  isOwnProfile: boolean;
  username: string;
}

const SkillsSection = ({ skills, isOwnProfile, username }: SkillsSectionProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Show only top 20 skills initially if we want to implement "Show more" functionality
  
  return (
    <>
      <Card className="p-6 mb-4 shadow-sm border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Skills</h2>
          {isOwnProfile && (
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(true)}
                className="hover:bg-muted rounded-full w-10 h-10" 
                title="Edit skills"
              >
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {skills.length === 0 ? (
             <p className="text-muted-foreground italic">No skills added yet.</p>
          ) : (
              <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                      <div 
                          key={`${skill}-${index}`} 
                          className="px-4 py-2 bg-background border border-border rounded-full text-foreground font-medium text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-default"
                      >
                          {skill}
                      </div>
                  ))}
              </div>
          )}
        </div>
        
        {skills.length > 20 && (
            <div className="border-t border-border mt-4 pt-3 text-center">
              <button className="text-muted-foreground font-semibold text-sm hover:underline hover:text-foreground">
                  Show all {skills.length} skills <span>→</span>
              </button>
            </div>
        )}
      </Card>

      {isOwnProfile && (
        <SkillsModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            initialSkills={skills}
            username={username}
        />
      )}
    </>
  );
};

export default SkillsSection;
