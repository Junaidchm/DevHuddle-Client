// app/components/IdeasList.tsx
import IdeaItem from './IdeaItem';

const IdeasList = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
      <IdeaItem
        bgColor="bg-pink-50"
        iconColor="text-pink-500"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        }
        title="GitCollab - Enhanced Code Reviews"
        date="3 days ago"
        description="A platform that integrates with GitHub to provide AI-assisted code reviews, highlighting potential bugs, security issues, and suggesting optimizations."
        tags={["GitHub Integration", "AI", "Code Review"]}
        status={{
          bg: "bg-blue-50",
          color: "text-blue-500",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          ),
          text: "In Review",
        }}
      />
      <IdeaItem
        bgColor="bg-green-50"
        iconColor="text-green-600"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        }
        title="DevMentor - AI Programming Assistant"
        date="1 week ago"
        description="An AI-powered programming assistant that helps developers learn new technologies by providing context-aware suggestions, examples, and explanations directly in their IDE."
        tags={["Machine Learning", "VSCode Extension", "Education"]}
        status={{
          bg: "bg-green-50",
          color: "text-green-500",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ),
          text: "Approved",
        }}
      />
      <IdeaItem
        bgColor="bg-blue-50"
        iconColor="text-blue-500"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          </svg>
        }
        title="CloudPulse - Serverless Monitoring"
        date="2 weeks ago"
        description="A serverless monitoring solution that provides real-time insights into function performance, cold starts, and cost optimization opportunities across multiple cloud providers."
        tags={["Serverless", "AWS", "Monitoring"]}
        status={{
          bg: "bg-red-50",
          color: "text-red-500",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          ),
          text: "Needs Revision",
        }}
      />
    </div>
  );
};

export default IdeasList;