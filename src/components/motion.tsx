"use client";

import { MotionConfig, motion, useInView, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Honour the OS "reduce motion" setting for every Motion animation. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Fades and lifts its children in when scrolled to. Content is visible in the
 * server HTML; only elements still off-screen after hydration get hidden and
 * then revealed, so nothing waits on JavaScript to appear.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Render as a list item so it can sit directly inside <ul>. */
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const Comp = as === "li" ? motion.li : motion.div;
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [phase, setPhase] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const r = ref.current!.getBoundingClientRect();
    const onScreen = r.top < window.innerHeight && r.bottom > 0;
    if (!onScreen) setPhase("hidden");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the in-view observer
    if (inView && phase === "hidden") setPhase("shown");
  }, [inView, phase]);

  return (
    <Comp
      ref={ref}
      className={className}
      initial={false}
      animate={phase === "hidden" ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={phase === "shown" ? { duration: 0.7, delay, ease: EASE } : { duration: 0 }}
    >
      {children}
    </Comp>
  );
}

/** Number that counts up from zero the first time it scrolls into view. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const format = (v: number) =>
    v.toLocaleString("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to]);

  // Server renders the final value, so it's correct without JavaScript.
  return <span ref={ref}>{format(to)}</span>;
}
