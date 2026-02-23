import React from "react";
import { fetchProfileByUsernameAction } from "../actions";
import { notFound } from "next/navigation";
import ProjectsList from "@/src/components/profile/ProjectsList";
import { auth } from "@/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default async function FullProjectsPage({ params }: { params: { user_name: string } }) {
  const { user_name } = await params;
  const user = await fetchProfileByUsernameAction(user_name);
  
  if (!user) {
    notFound();
  }

  const session = await auth();
  const currentUserId = session?.user?.id;

  return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
            <Link href={`/profile/${user_name}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
             <div>
                <h1 className="text-2xl font-bold leading-tight">All Projects</h1>
                <p className="text-muted-foreground text-sm">from {user.name}</p>
            </div>
        </div>
        
        <div className="space-y-4">
             <ProjectsList userId={user.id} currentUserId={currentUserId} />
        </div>
    </div>
  );
}
