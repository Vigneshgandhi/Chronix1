"use client";

import { Circle } from "lucide-react";

const DEFAULT_AVATAR = "🙂";

/**
 * Renders using the same profile shape everywhere in the app:
 * { name, avatarEmoji }. isTyping alone controls visibility —
 * name/avatar are just display details and must never block
 * the indicator from showing.
 */
export default function TypingIndicator({
  name,
  avatarEmoji = DEFAULT_AVATAR,
  isTyping,
}) {
  if (!isTyping) return null;

  return (
    <div className="flex items-end gap-3 px-6 py-3">

      {/* Avatar */}

      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-chronix-secondary/70 bg-chronix-primary/15 text-xl">
        {avatarEmoji}
      </div>

      {/* Bubble */}

      <div className="rounded-3xl rounded-bl-md border border-chronix-secondary/20 bg-chronix-elevated px-5 py-4 shadow-sm">

        <div className="flex items-center gap-1">

          <Circle
            fill="currentColor"
            size={8}
            className="animate-bounce text-chronix-accent"
          />

          <Circle
            fill="currentColor"
            size={8}
            className="animate-bounce text-chronix-accent"
            style={{ animationDelay: "0.15s" }}
          />

          <Circle
            fill="currentColor"
            size={8}
            className="animate-bounce text-chronix-accent"
            style={{ animationDelay: "0.3s" }}
          />

        </div>

      </div>

      {/* Text */}

      <span className="text-sm text-slate-400">
        {name ? `${name} is typing...` : "Typing..."}
      </span>

    </div>
  );
}
