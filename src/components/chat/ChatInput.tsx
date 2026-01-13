import React, { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-end gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          className="p-2.5 text-gray-500 hover:text-[#0A66C2] transition-colors rounded-lg hover:bg-blue-50 flex-shrink-0"
          disabled={disabled}
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Attachment Button */}
        <button
          type="button"
          className="p-2.5 text-gray-500 hover:text-[#0A66C2] transition-colors rounded-lg hover:bg-blue-50 flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip className="w-6 h-6" />
        </button>

        {/* Input Field */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-[15px] text-gray-800 resize-none focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/10 transition-all max-h-32 placeholder:text-gray-400"
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`
            p-3 rounded-full transition-all flex-shrink-0 shadow-sm
            ${message.trim() && !disabled
              ? 'bg-[#0A66C2] text-white hover:bg-[#004182] transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
