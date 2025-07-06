export interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  trendIcon: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profilePicture: string | null;
  name: string;
  password: string;
  location: string | null;
  bio: string | null;
  skills: string[];
  yearsOfExperience: string | null;
  jobTitle: string | null;
  company: string | null;
  emailVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
