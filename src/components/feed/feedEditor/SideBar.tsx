
// app/components/Sidebar.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSuggestedUsersWithFollowerInfo } from "@/src/app/actions/follow";
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import SidebarClient from "./SideBarClient";

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signIn");

  const queryClient = new QueryClient();
  const suggestions = await getSuggestedUsersWithFollowerInfo(5);

  // Pre-hydrate the suggestions for the client
  await queryClient.prefetchQuery({
    queryKey: ["suggestions", session.user.id],
    queryFn: async () => suggestions,
    staleTime: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarClient id={session.user.id} />
    </HydrationBoundary>
  );
}
