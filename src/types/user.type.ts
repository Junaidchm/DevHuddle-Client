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
  jobTitle: string | null;
  createdAt: string; // Serialized as string from server
  _count: {
    followers: number;
    following: number;
  };
  isFollowing?: boolean; // From the perspective of the logged-in user
};