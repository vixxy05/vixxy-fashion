"use client";

import { ChatAvatar } from "./Avatar";
import type { Conversation } from "./types";

export function InfoPanel({
  conversation,
  onAddMember,
}: {
  conversation?: Conversation;
  onAddMember: () => void;
}) {
  return (
    <aside className="hidden w-[320px] shrink-0 border-l border-white/10 bg-neutral-950/60 p-4 lg:block">
      {!conversation ? null : (
        <>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-950 px-4 py-5 ring-1 ring-white/10">
            <ChatAvatar
              src={conversation.avatar}
              alt={conversation.name}
              size="lg"
              presence={conversation.presence}
            />
            <p className="text-sm font-semibold text-white">{conversation.name}</p>
            <p className="text-xs text-white/45">
              {conversation.isGroup
                ? `${conversation.members.length} thành viên`
                : conversation.presence === "online"
                  ? "Đang hoạt động"
                  : "Ngoại tuyến"}
            </p>
            {conversation.isGroup && (
              <button
                type="button"
                onClick={onAddMember}
                className="mt-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                + Thêm thành viên
              </button>
            )}
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
              Thành viên
            </h3>
            <ul className="space-y-2">
              {conversation.members.map((m) => (
                <li key={m.id} className="flex items-center gap-2">
                  <ChatAvatar src={m.avatar} alt={m.name} size="sm" presence={m.presence} />
                  <span className="text-xs text-white">{m.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">
              Ảnh & file đã chia sẻ
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square rounded-xl bg-white/5 ring-1 ring-white/10" />
              <div className="aspect-square rounded-xl bg-white/5 ring-1 ring-white/10" />
              <div className="aspect-square rounded-xl bg-white/5 ring-1 ring-white/10" />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

