export type UserProfile = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  emailVerified: boolean | null;
  profilePicture: string | null;
  location: string | null;
  bio: string | null;
  coverImage: string | null;
  jobTitle: string | null;
  company: string | null;
  skills: string[];
  yearsOfExperience: string | null;
  createdAt: string; // Serialized as string from server
  _count: {
    followers: number;
    following: number;
  };
  isFollowing?: boolean; // From the perspective of the logged-in user
  isFollowedByUser?: boolean; // Whether the logged-in user follows this user
  experience?: Experience[];
  education?: Education[];
};

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  logoUrl?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  activities?: string;
  description?: string;
  logoUrl?: string;
}