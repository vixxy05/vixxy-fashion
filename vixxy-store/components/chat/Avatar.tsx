"use client";

import type { Presence } from "./types";

export function ChatAvatar({
  src,
  alt,
  presence,
  size = "md",
}: {
  src: string;
  alt: string;
  presence?: Presence;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? 44 : size === "sm" ? 28 : 36;
  return (
    <div className="relative inline-flex shrink-0">
      <img
        src={src}
        alt={alt}
        className="rounded-full object-cover"
        style={{ width: dim, height: dim }}
      />
      {presence && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-neutral-950 ${
            presence === "online" ? "bg-emerald-400" : "bg-neutral-500"
          }`}
        />
      )}
    </div>
  );
}
