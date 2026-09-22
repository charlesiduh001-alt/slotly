"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const DEMO_STEPS = [
  { title: "Choose a service", text: "See prices and how long each one takes up front." },
  { title: "Pick a time", text: "Only genuinely free slots are shown, updated live." },
  { title: "Get confirmed", text: "Instant booking reference you can use to manage or cancel." },
];

/** "How it works": step list synced with an auto-playing phone mockup. */
export function BookingDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % DEMO_STEPS.length), 2800);
    return () => clearTimeout(id);
  }, [step, inView, paused, reduce]);

  return (
    <div ref={ref} className="grid items-center gap-12 md:grid-cols-2">
      <ol className="space-y-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {DEMO_STEPS.map((s, i) => {
          const active = i === step;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-pressed={active}
                className={`relative flex w-full gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-colors ${
                  active ? "border-accent/40 bg-surface shadow-lg shadow-plum-600/5" : "border-transparent hover:bg-surface/60"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full font-semibold transition-colors ${
                    active ? "bg-plum-600 text-white" : "bg-plum-50 text-accent"
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="text-sm text-muted">{s.text}</span>
                </span>
                {active && !reduce && !paused && inView && (
                  <motion.span
                    key={`bar-${step}`}
                    aria-hidden
                    className="absolute bottom-0 left-0 h-0.5 bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.8, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="relative mx-auto w-full max-w-[300px]" aria-hidden>
        <div className="absolute -inset-8 rounded-full bg-plum-100/60 blur-3xl" />
        <div className="relative rounded-[2.5rem] border border-line bg-surface p-3 shadow-2xl shadow-plum-900/20">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-sand" />
          <div className="relative h-[380px] overflow-hidden rounded-[1.8rem] bg-cream p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="h-full"
              >
                {step === 0 && <DemoServices />}
                {step === 1 && <DemoTimes />}
                {step === 2 && <DemoTicket />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoServices() {
  const items = [
    ["Silk Press", "₦25,000"],
    ["Knotless Braids", "₦45,000"],
    ["Gel Manicure", "₦10,000"],
    ["Men's Cut", "₦8,000"],
  ];
  return (
    <div>
      <p className="font-display text-lg font-semibold">Choose a service</p>
      <div className="mt-3 space-y-2">
        {items.map(([name, price], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, scale: i === 0 ? [1, 1, 0.97, 1] : 1 }}
            transition={{ delay: 0.1 + i * 0.08, duration: i === 0 ? 1.4 : 0.4, times: i === 0 ? [0, 0.6, 0.75, 1] : undefined }}
            className={`flex justify-between rounded-xl border px-3 py-2.5 text-xs ${
              i === 0 ? "border-accent bg-plum-50 font-semibold" : "border-line bg-surface"
            }`}
          >
            <span>{name}</span>
            <span className="text-muted">{price}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DemoTimes() {
  const times = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "1:00"];
  return (
    <div>
      <p className="font-display text-lg font-semibold">Pick a time</p>
      <p className="text-xs text-muted">Thursday, 24 September</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {times.map((t, i) => {
          const chosen = i === 4;
          return (
            <motion.div
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="relative"
            >
              <div className="rounded-lg border border-line bg-surface py-2 text-center text-xs font-medium">{t}</div>
              {chosen && (
                <motion.div
                  className="absolute inset-0 grid place-items-center rounded-lg bg-plum-600 text-xs font-medium text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.25 }}
                >
                  {t}
                </motion.div>
              )}
              {chosen && (
                <motion.span
                  className="absolute inset-0 rounded-lg border-2 border-accent"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0, 0.8, 0], scale: [1, 1, 1.35] }}
                  transition={{ delay: 1.1, duration: 0.7 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DemoTicket() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <motion.span
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
        className="grid size-14 place-items-center rounded-full bg-success text-2xl text-white"
      >
        ✓
      </motion.span>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-3 font-display text-xl font-semibold"
      >
        You&apos;re booked!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ease: EASE, duration: 0.5 }}
        className="mt-4 w-full rounded-xl border border-dashed border-line bg-surface p-3 text-left text-xs"
      >
        <p className="text-muted">Reference</p>
        <p className="font-mono font-semibold tracking-wider">SL-7K2M9Q</p>
        <div className="mt-2 flex justify-between border-t border-dashed border-line pt-2">
          <span>Silk Press</span>
          <span className="text-muted">Thu · 11:00 AM</span>
        </div>
      </motion.div>
    </div>
  );
}

type Testimonial = { quote: string; name: string; detail: string };

/** Auto-rotating quotes; pauses on hover/focus and can be driven by the dots. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % items.length), 5500);
    return () => clearTimeout(id);
  }, [index, paused, reduce, items.length]);

  const t = items[index];
  return (
    <div
      className="relative mx-auto max-w-3xl text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span aria-hidden className="font-display text-7xl leading-none text-accent/30">&ldquo;</span>
      <div className="relative min-h-[180px] sm:min-h-[150px]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.figure
            key={index}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <blockquote className="font-display text-xl leading-relaxed text-balance sm:text-2xl">{t.quote}</blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="text-muted"> · {t.detail}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show review ${i + 1} of ${items.length}`}
            aria-current={i === index}
            className="grid h-6 place-items-center px-1"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-accent" : "w-1.5 bg-line hover:bg-muted"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
