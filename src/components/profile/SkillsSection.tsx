import React from 'react';
import { Pencil } from 'lucide-react';
import SkillsModal from './modals/SkillsModal';

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
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Skills</h2>
          {isOwnProfile && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                title="Edit skills"
              >
                <Pencil size={20} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {skills.length === 0 ? (
             <p className="text-gray-500 italic">No skills added yet.</p>
          ) : (
              <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                      <div 
                          key={`${skill}-${index}`} 
                          className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 font-medium text-sm hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-default"
                      >
                          {skill}
                      </div>
                  ))}
              </div>
          )}
        </div>
        
        {skills.length > 20 && (
            <div className="border-t border-gray-100 mt-4 pt-3 text-center">
              <button className="text-gray-600 font-semibold text-sm hover:underline">
                  Show all {skills.length} skills <span>→</span>
              </button>
            </div>
        )}
      </div>

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
