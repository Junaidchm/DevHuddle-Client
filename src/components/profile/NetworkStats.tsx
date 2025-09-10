// app/components/NetworkStats.tsx
import NetworkStatCard from './NetworkStatCard';

interface NetworkStatsProps {
  followers: string;
  following: string;
  topDomain: string;
  followerChange: string;
  followingChange: string;
  domainPercentage: string;
}

const NetworkStats = ({ followers, following, topDomain, followerChange, followingChange, domainPercentage }: NetworkStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
        footer={<><span className="text-green-600 font-medium">+{followerChange}</span> new followers this month</>}
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
        footer={<><span className="text-green-600 font-medium">+{followingChange}</span> new following this month</>}
      />
      <NetworkStatCard
        title="Top Domain"
        value={topDomain}
        bgColor="bg-red-50"
        iconColor="text-red-500"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        }
        footer={<><span className="text-green-600 font-medium">{domainPercentage}%</span> of your network connections</>}
      />
    </div>
  );
};

export default NetworkStats;