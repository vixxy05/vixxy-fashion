"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border-t border-white/10 bg-neutral-950/40 px-3 py-3 md:px-4"
    >
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10"
        aria-label="Emoji"
        title="Emoji"
      >
        🙂
      </button>
      <button
        type="button"
        className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 sm:flex"
        aria-label="Đính kèm"
        title="Đính kèm"
      >
        ⎘
      </button>

      <div className="flex min-w-0 flex-1 rounded-2xl bg-neutral-950 px-3 py-2 ring-1 ring-white/10">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="max-h-28 min-h-[28px] w-full resize-none bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
      </div>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.98 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black hover:bg-neutral-200"
        aria-label="Gửi"
        title="Gửi"
      >
        ➤
      </motion.button>
    </form>
  );
}

