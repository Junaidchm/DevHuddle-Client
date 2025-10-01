import { getSession } from "next-auth/react";

export async function authHeaders() {
  const session = await getSession();
  if (!session?.user?.accessToken) return {};
  return {
    Authorization: `Bearer ${session.user.accessToken}`,
  };
}