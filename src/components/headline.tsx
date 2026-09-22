import { Fragment } from "react";

/**
 * Headline whose words rise in one after another. Pure CSS, so it animates
 * from the first paint without waiting for JavaScript.
 */
export function AnimatedHeadline({
  text,
  highlight,
  className,
}: {
  text: string;
  /** Trailing words rendered with the gradient accent. */
  highlight?: string;
  className?: string;
}) {
  const words = [
    ...text.split(" ").map((w) => ({ w, hi: false })),
    ...(highlight?.split(" ") ?? []).map((w) => ({ w, hi: true })),
  ];
  return (
    <h1 className={className}>
      {words.map(({ w, hi }, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <span
              className={`inline-block animate-word ${hi ? "text-gradient" : ""}`}
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              {w}
            </span>
          </span>
          {/* Space outside the inline-block, or the browser trims it. */}
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </h1>
  );
}
