"use client";

// Inline script that runs during HTML parsing (before first paint). On the
// client it renders as inert text/plain, which avoids React's dev warning about
// script tags; suppressHydrationWarning accepts the type mismatch.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
