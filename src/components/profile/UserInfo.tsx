
// app/components/UserInfo.tsx
interface UserInfoProps {
  name: string;
  username: string;
  role: string;
  bio: string;
  location: string;
  timezone: string;
  joined: string;
  isVerified: boolean;
  company?: string | null;
}

const UserInfo = ({ name, username, role, bio, location, timezone, joined, isVerified, company }: UserInfoProps) => {
  return (
    <div className="pt-14">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="m-0 text-3xl font-bold text-slate-800">{name}</h1>
        {isVerified && (
          <div className="bg-emerald-50 text-emerald-500 text-xs font-medium py-1 px-3 rounded-full flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Verified
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-base text-slate-500 font-medium">@{username}</span>
        {role && (
          <>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-sm text-slate-500">{role}</span>
          </>
        )}
        {company && (
          <>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-sm text-slate-500">{company}</span>
          </>
        )}
      </div>
      <p className="m-0 mb-4 text-[0.938rem] text-slate-600 max-w-[550px] leading-6">{bio}</p>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className="text-sm">{timezone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          <span className="text-sm">Member since {joined}</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;