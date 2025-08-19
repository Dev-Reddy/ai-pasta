// components/ui/unified-chat-input.tsx
"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIProvider } from "@/lib/types";

interface UnifiedChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  enabledProviders: AIProvider[];
  className?: string;
}

export function UnifiedChatInput({
  onSendMessage,
  isLoading,
  enabledProviders,
  className,
}: UnifiedChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const enabledCount = enabledProviders.length;

  return (
    <div className={cn("border-t border-gray-800 bg-gray-900 p-4", className)}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="flex items-center  gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                enabledCount > 0
                  ? `Ask all AI models...`
                  : "Enable at least one AI model to start chatting..."
              }
              className="min-h-[50px] max-h-[150px] resize-none pr-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
              disabled={isLoading || enabledCount === 0}
            />
          </div>

          <Button
            type="submit"
            disabled={!message.trim() || isLoading || enabledCount === 0}
            className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            {enabledCount > 0
              ? `Send to all enabled AI models`
              : "Enable AI models in the toggles above to start chatting"}
          </p>
        </div>
      </form>
    </div>
  );
}
