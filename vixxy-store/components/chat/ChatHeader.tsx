"use client";

import { ChatAvatar } from "./Avatar";
import type { Conversation } from "./types";

export function ChatHeader({ conversation }: { conversation: Conversation }) {
  const subtitle = conversation.isGroup
    ? `${conversation.members.length} thành viên`
    : conversation.presence === "online"
      ? "Đang hoạt động"
      : "Ngoại tuyến";

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-neutral-950/40 px-4">
      <div className="flex items-center gap-3">
        <ChatAvatar
          src={conversation.avatar}
          alt={conversation.name}
          size="lg"
          presence={conversation.presence}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white md:text-base">
            {conversation.name}
          </p>
          <p className="text-xs text-white/45">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
        >
          Tùy chọn
        </button>
      </div>
    </header>
  );
}

