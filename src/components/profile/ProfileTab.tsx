// app/components/ProfileTab.tsx
const ProfileTab = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a href={href} className="px-6 py-4 text-sm font-medium text-slate-500 no-underline transition-all duration-200 hover:text-blue-500">
      {children}
    </a>
  );
};

export default ProfileTab;