import { StatCardProps } from "@/src/app/types";

const StatCard: React.FC<StatCardProps> = ({
  iconBgColor,
  icon,
  iconColor,
  title,
  value,
  trendColor,
  trendIcon,
  trend,
}) => {
  return (
    <div className="rounded-lg bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] hover:transform hover:-translate-y-[5px] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
      <div className="p-4 flex items-center gap-4">
        <div
          className={`w-12 h-12 ${iconBgColor} rounded-md flex items-center justify-center text-xl`}
        >
          <i className={`fas ${icon} ${iconColor}`}></i>
        </div>
        <div className="flex-1">
          <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
          <p className={`text-xs ${trendColor} flex items-center gap-1`}>
            <i className={`fas ${trendIcon}`}></i> {trend}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
