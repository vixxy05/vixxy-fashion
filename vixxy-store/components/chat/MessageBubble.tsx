"use client";

import type { Message, User } from "./types";
import { ChatAvatar } from "./Avatar";

export function MessageBubble({
  message,
  sender,
  isMe,
}: {
  message: Message;
  sender: User;
  isMe: boolean;
}) {
  return (
    <div className={`flex w-full gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="mt-5">
          <ChatAvatar src={sender.avatar} alt={sender.name} size="sm" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ring-1 ${
          isMe
            ? "rounded-br-sm bg-white text-black ring-white/10"
            : "rounded-bl-sm bg-neutral-950 text-white ring-white/10"
        }`}
      >
        {!isMe && (
          <p className="mb-0.5 text-[11px] font-semibold text-white/70">
            {sender.name}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <p className={`mt-1 text-[10px] ${isMe ? "text-black/50" : "text-white/40"}`}>
          {message.createdAt}
        </p>
      </div>
    </div>
  );
}

