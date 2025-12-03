// app/components/NetworkStats.tsx
import NetworkStatCard from './NetworkStatCard';

interface NetworkStatsProps {
  followers: string;
  following: string;
}

const NetworkStats = ({ followers, following }: NetworkStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <NetworkStatCard
        title="Total Followers"
        value={followers}
        bgColor="bg-blue-50"
        iconColor="text-blue-500"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
        }
      />
      <NetworkStatCard
        title="Following"
        value={following}
        bgColor="bg-green-50"
        iconColor="text-green-600"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="18" y1="8" x2="23" y2="13"></line>
            <line x1="23" y1="8" x2="18" y2="13"></line>
          </svg>
        }
      />
    </div>
  );
};

export default NetworkStats;