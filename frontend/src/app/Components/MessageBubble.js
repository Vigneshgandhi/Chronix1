"use client";

import { Check, CheckCheck } from "lucide-react";

export default function MessageBubble({ message }) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[75%] rounded-3xl px-5 py-4 shadow-lg transition-all duration-300 hover:shadow-chronix-primary/10 ${
          isMe
            ? "rounded-br-md bg-chronix-primary text-white"
            : "rounded-bl-md border border-chronix-secondary/20 bg-chronix-elevated text-chronix-deep"
        }`}
      >
        {/* Sender Name */}
        {!isMe && (
          <p className="mb-2 text-xs font-semibold text-chronix-label">
            {message.sender}
          </p>
        )}

        {/* Text Message */}
        {message.text && (
          <p className="whitespace-pre-wrap break-words leading-7">
            {message.text}
          </p>
        )}

        {/* Image Message */}
        {message.image && (
          <img
            src={message.image}
            alt="Shared"
            className="mt-2 max-h-72 w-full rounded-2xl object-cover"
          />
        )}

        {/* File Attachment */}
        {message.file && (
          <div className="mt-3 rounded-xl border border-chronix-secondary/20 bg-white/80 p-4">
            <p className="font-medium">{message.file.name}</p>
            <p className="mt-1 text-xs opacity-70">
              {message.file.size}
            </p>
          </div>
        )}

        {/* Time & Status */}
        <div
          className={`mt-3 flex items-center justify-end gap-1 text-xs ${
            isMe ? "text-white/70" : "text-slate-400"
          }`}
        >
          <span>{message.time}</span>

          {isMe && (
            <>
              {message.status === "sent" && (
                <Check size={15} />
              )}

              {message.status === "delivered" && (
                <CheckCheck size={15} />
              )}

              {message.status === "read" && (
                <CheckCheck
                  size={15}
                  className="text-blue-600"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
