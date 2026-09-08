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
    <div className={cn("border-t border-white/[0.08] bg-[#080b18]/90 p-4 backdrop-blur-xl", className)}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="flex items-end gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.06] p-2 shadow-2xl shadow-black/20 focus-within:border-violet-400/50 focus-within:ring-4 focus-within:ring-violet-500/10">
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
              className="min-h-[52px] max-h-[150px] resize-none border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0"
              disabled={isLoading || enabledCount === 0}
            />
          </div>

          <Button
            type="submit"
            disabled={!message.trim() || isLoading || enabledCount === 0}
            className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/40 hover:from-violet-400 hover:to-fuchsia-400"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs text-slate-500">
            {enabledCount > 0
              ? `Send to all enabled AI models`
              : "Enable AI models in the toggles above to start chatting"}
          </p>
        </div>
      </form>
    </div>
  );
}
