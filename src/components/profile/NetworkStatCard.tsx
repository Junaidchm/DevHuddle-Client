// app/components/NetworkStatCard.tsx
interface NetworkStatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  footer?: React.ReactNode;
}

const NetworkStatCard = ({ title, value, icon, bgColor, iconColor, footer }: NetworkStatCardProps) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-500 mb-2">{title}</div>
          <div className="text-2xl font-bold text-slate-800">{value}</div>
        </div>
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      {footer && <div className="mt-4 text-xs text-slate-500">{footer}</div>}
    </div>
  );
};

export default NetworkStatCard;