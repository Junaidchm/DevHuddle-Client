// app/components/ProfileNav.tsx
import ProfileTab from './ProfileTab';

const ProfileNav = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 overflow-x-auto">
      <div className="flex border-b border-slate-100 min-w-max profile-tabs">
        <ProfileTab href="#followers">Followers</ProfileTab>
        <ProfileTab href="#ideas">Ideas</ProfileTab>
      </div>
    </div>
  );
};

export default ProfileNav;