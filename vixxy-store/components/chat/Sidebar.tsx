"use client";

import { motion } from "framer-motion";
import { ChatAvatar } from "./Avatar";
import type { Conversation, User } from "./types";

export function ChatSidebar({
  me,
  conversations,
  activeId,
  onSelect,
  onCreateGroup,
}: {
  me: User;
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onCreateGroup: () => void;
}) {
  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-white/10 bg-neutral-950/60 p-3 md:flex md:flex-col">
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-neutral-950 px-3 py-2 ring-1 ring-white/10">
        <ChatAvatar src={me.avatar} alt={me.name} presence={me.presence} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{me.name}</p>
          <p className="text-xs text-emerald-400">Trực tuyến</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-neutral-950 px-3 py-2 ring-1 ring-white/10">
        <svg
          className="h-4 w-4 text-white/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          placeholder="Tìm kiếm..."
          className="h-8 w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
      </div>

      <div className="mb-2 flex items-center justify-between px-1 text-[11px] uppercase tracking-wider text-white/45">
        <span>Cuộc trò chuyện</span>
        <button
          type="button"
          onClick={onCreateGroup}
          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black hover:bg-neutral-200"
        >
          + Nhóm
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              whileTap={{ scale: 0.99 }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ring-1 ring-transparent transition hover:bg-white/5 ${
                active ? "bg-white/8 ring-white/10" : ""
              }`}
            >
              <ChatAvatar src={c.avatar} alt={c.name} presence={c.presence} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {c.name}
                </p>
                <p className="truncate text-xs text-white/45">
                  {c.isGroup ? `${c.members.length} thành viên` : "Tin nhắn"}
                </p>
              </div>
              <span className="text-xs text-white/30">›</span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}

