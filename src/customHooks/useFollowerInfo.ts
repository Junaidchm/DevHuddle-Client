import { useQuery } from "@tanstack/react-query";
import { FollowerInfo } from "../app/types";
import { getFollowerInfo } from "../services/api/profile.service";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => getFollowerInfo(userId),
    initialData: initialState,
    staleTime: Infinity,
  });
}
