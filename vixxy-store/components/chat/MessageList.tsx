"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type { Message, User } from "./types";
import { MessageBubble } from "./MessageBubble";
import { aiAssistant } from "./data";

export function MessageList({
  messages,
  me,
  members,
  isAITyping = false,
}: {
  messages: Message[];
  me: User;
  members: User[];
  isAITyping?: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const senderMap = useMemo(() => {
    const map = new Map<string, User>();
    [me, ...members].forEach((u) => map.set(u.id, u));
    return map;
  }, [me, members]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAITyping]);

  return (
    <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          sender={senderMap.get(m.senderId) ?? me}
          isMe={m.senderId === me.id}
        />
      ))}
      {isAITyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 items-start"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={aiAssistant.avatar} alt="AI" className="w-full h-full object-cover" />
          </div>
          <div className="bg-neutral-800 text-white p-3 rounded-2xl rounded-tl-none">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </motion.div>
      )}
      <div ref={endRef} />
    </div>
  );
}

