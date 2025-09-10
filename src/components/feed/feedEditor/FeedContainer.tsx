import React, { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostCard from "./PostCard";
import { FeedResponse } from "@/src/app/types/feed";
import { fetchFeed } from "@/src/services/api/feed.service";
import {
  getSession,
  serverFetch,
} from "@/src/app/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function FeedContainer() {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "/"; 
  console.log("FeedContainer pathname:", pathname);
  console.log("this is the pathName:", pathname);
  const { session, needsRefresh, needsLogout } = await getSession();

  if (!session) {
    if (needsRefresh) {
      redirect(`/api/auth/refresh?returnTo=${encodeURIComponent(pathname)}`);
    }
    if (needsLogout) {
      redirect("/api/auth/logout");
    }
  }

  let data;
  try {

    const response = await serverFetch("/feed/list");
    data = await response.json();

    console.log('this is the data          ' , data)
  } catch (error) {
    console.error('Fetch error:', error);
    redirect('/api/auth/logout');
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto p-4">
      {/* <PostCard key={123421} post={{}} /> */}

      <h1> this is the post data </h1>
      {/*       
      <button
        className="text-blue-600 hover:underline"
        aria-label="Load more posts"
      >
        Load more
      </button> */}
    </div>
  );
}
