"use client";

import type { FormEvent } from "react";
import { Modal } from "./Modal";

export function AddMemberModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (nameOrEmail: string) => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const member = String(form.get("member") ?? "").trim();
    if (!member) return;
    onAdd(member);
    event.currentTarget.reset();
    onClose();
  };

  return (
    <Modal open={open} title="Thêm thành viên" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-white/70">
            Tìm theo tên hoặc email
          </label>
          <input
            name="member"
            required
            className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/25"
            placeholder="linh@company.com"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black hover:bg-neutral-200"
        >
          Thêm vào nhóm
        </button>
      </form>
    </Modal>
  );
}
