// app/components/IdeaItem.tsx
interface IdeaProps {
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  status: { bg: string; color: string; icon: React.ReactNode; text: string };
}

const IdeaItem = ({ icon, bgColor, iconColor, title, date, description, tags, status }: IdeaProps) => {
  return (
    <div className="p-5 border-b border-slate-100 last:border-b-0 flex gap-4 items-start">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <h4 className="m-0 text-base font-semibold text-slate-800">{title}</h4>
          <div className="text-sm text-slate-500">{date}</div>
        </div>
        <p className="m-0 mb-3 text-sm text-slate-500">{description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span key={index} className="bg-slate-100 text-slate-500 text-xs py-1 px-2 rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className={`${status.bg} ${status.color} text-xs font-medium py-1 px-2 rounded flex items-center gap-1`}>
            {status.icon}
            {status.text}
          </div>
          <a href="submit-idea.html" className="text-sm text-blue-500 no-underline flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            View Idea
          </a>
        </div>
      </div>
    </div>
  );
};

export default IdeaItem;