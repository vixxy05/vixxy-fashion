"use client";

import type { FormEvent } from "react";
import { Modal } from "./Modal";

export function CreateGroupModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    onCreate(name);
    event.currentTarget.reset();
    onClose();
  };

  return (
    <Modal open={open} title="Tạo nhóm mới" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">
            Tên nhóm
          </label>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            placeholder="Nhóm thiết kế tối nay"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">
            Mô tả (tuỳ chọn)
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            placeholder="Mục tiêu, deadline..."
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black hover:bg-neutral-200"
        >
          Tạo nhóm
        </button>
      </form>
    </Modal>
  );
}
