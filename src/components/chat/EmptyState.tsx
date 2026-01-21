import { MessageCircle, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface EmptyStateProps {
  onNewChat: () => void;
}

export function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
      <div className="bg-white rounded-full p-6 mb-4 shadow-sm">
        <MessageCircle className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No conversations yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm text-sm leading-relaxed">
        Start a conversation with your connections to collaborate, share ideas, and build together.
      </p>
      <Button 
        onClick={onNewChat}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Start New Chat
      </Button>
    </div>
  );
}
