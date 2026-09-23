"use client";

import { useState } from "react";

/** Copies text to the clipboard and briefly confirms. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the text stays selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-sm border border-hairline bg-canvas px-2 text-[12px] font-semibold text-ink active:bg-surface-soft"
      aria-label={copied ? "Copied" : `${label} ${text}`}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" className="size-3.5 text-success-text" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
          </svg>
          {label}
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? "Reference copied" : ""}
      </span>
    </button>
  );
}
