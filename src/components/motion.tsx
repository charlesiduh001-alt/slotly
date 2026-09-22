"use client";

import { MotionConfig, motion, useInView, useMotionValue, useSpring, useTransform, animate } from "motion/react";
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
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={phase === "hidden" ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={phase === "shown" ? { duration: 0.7, delay, ease: EASE } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}

/** Card that tilts toward the pointer with a soft spotlight following it. */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const spotX = useTransform(px, (v) => `${v * 100}%`);
  const spotY = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useTransform(
    [spotX, spotY],
    ([x, y]) => `radial-gradient(420px circle at ${x} ${y}, var(--c-glow), transparent 55%)`,
  );

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      {children}
    </motion.div>
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
