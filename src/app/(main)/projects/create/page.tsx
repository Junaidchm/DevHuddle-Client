"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateProjectModal from "@/src/components/projects/CreateProjectModal";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/projects");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <CreateProjectModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}

