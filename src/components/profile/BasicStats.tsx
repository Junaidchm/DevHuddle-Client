// app/components/BasicStats.tsx
import Stat from './Stat';

interface BasicStatsProps {
  following: string;
  followers: string;
  projects: string;
}

const BasicStats = ({ following, followers, projects }: BasicStatsProps) => {
  return (
    <div className="flex gap-6">
      <Stat value={following} label="Following" />
      <Stat value={followers} label="Followers" />
      <Stat value={projects} label="Projects" />
    </div>
  );
};

export default BasicStats;