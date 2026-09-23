"use client";

import { useEffect, useState } from "react";
import { NOTICES, type NoticeKey } from "@/lib/notices";

/**
 * One-off feedback message after a server action redirect (?notice=key).
 * Removes the param from the URL so a refresh doesn't show it again.
 */
export function Notice({ notice }: { notice: NoticeKey }) {
  const [visible, setVisible] = useState(true);
  const [kind, message] = NOTICES[notice];

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url);
  }, [notice]);

  if (!visible) return null;
  const success = kind === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex animate-rise items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        success ? "border-success/30 bg-success/10 text-success" : "animate-shake border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      <span aria-hidden className="mt-px font-bold">
        {success ? "✓" : "!"}
      </span>
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss message"
        className="-my-1 -mr-2 grid size-8 place-items-center rounded-full opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
