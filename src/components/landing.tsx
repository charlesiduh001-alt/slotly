"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { tab: "Choose a service", title: "See every price and duration up front", text: "No surprises at the chair. Every service lists exactly how long it takes and what it costs." },
  { tab: "Pick a time", title: "Only genuinely free times are shown", text: "Availability is calculated live from opening hours and existing bookings, so you can't double-book." },
  { tab: "Get confirmed", title: "Instant confirmation and a reference", text: "Add it to your calendar in one tap, and use your reference to find or cancel your booking later." },
];

/**
 * "How it works": a nav-pill-group switcher over a product-mockup card that
 * shows the real booking UI for each step. Auto-advances while in view.
 */
export function BookingDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), 3200);
    return () => clearTimeout(id);
  }, [step, inView, paused, reduce]);

  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)}>
      <div className="flex justify-center">
        <div className="pill-group border border-hairline bg-hairline-soft" role="tablist" aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <button
              key={s.tab}
              type="button"
              role="tab"
              id={`demo-tab-${i}`}
              aria-selected={i === step}
              aria-controls="demo-panel"
              onClick={() => setStep(i)}
              className={i === step ? "pill-tab-active" : "pill-tab"}
            >
              <span className={`mr-1.5 tabular-nums ${i === step ? "text-accent" : "text-muted-soft"}`}>{i + 1}</span>
              {s.tab}
            </button>
          ))}
        </div>
      </div>

      <div
        id="demo-panel"
        role="tabpanel"
        aria-labelledby={`demo-tab-${step}`}
        className="mt-8 grid items-center gap-8 rounded-xl border border-hairline bg-canvas p-6 md:grid-cols-2 md:p-10"
      >
        <div aria-live="polite">
          <p className="caption text-muted">Step {step + 1} of 3</p>
          <h3 className="mt-2 display-sm">{STEPS[step].title}</h3>
          <p className="mt-3 body-md text-muted">{STEPS[step].text}</p>
        </div>
        <div className="rounded-lg bg-surface-card p-5 md:p-6" aria-hidden>
          <div className="h-[260px] overflow-hidden rounded-md border border-hairline bg-canvas p-4 shadow-soft">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {step === 0 && <DemoServices />}
                {step === 1 && <DemoTimes />}
                {step === 2 && <DemoConfirmed />}
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
    ["Silk Press", "1 hr 30 min", "₦25,000"],
    ["Knotless Braids", "4 hr", "₦45,000"],
    ["Gel Manicure", "1 hr", "₦10,000"],
    ["Men's Cut & Line-up", "45 min", "₦8,000"],
  ];
  return (
    <ul className="space-y-2">
      {items.map(([name, duration, price], i) => (
        <motion.li
          key={name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 * i }}
          className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-[13px] ${
            i === 0 ? "border-accent bg-accent-fill/5" : "border-hairline"
          }`}
        >
          <span className="font-semibold text-ink">{name}</span>
          <span className="text-muted">
            {duration} · {price}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function DemoTimes() {
  const times = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM"];
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">
        Thu <span className="font-normal text-muted">24 Sept</span>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {times.map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
            className={`rounded-md border py-2 text-center text-[12px] font-semibold ${
              i === 4 ? "border-accent-fill bg-accent-fill text-white" : "border-hairline text-ink"
            }`}
          >
            {t}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DemoConfirmed() {
  return (
    <div className="flex h-full flex-col items-center pt-4 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="grid size-10 place-items-center rounded-full bg-success/15 text-success-text"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </motion.span>
      <p className="mt-3 font-display text-[20px] tracking-[-0.3px] text-ink">You&apos;re booked</p>
      <dl className="mt-4 w-full divide-y divide-hairline border-y border-hairline text-left text-[12px]">
        {[
          ["What", "Silk Press · 1 hr 30 min"],
          ["When", "Thu 24 Sept, 11:00 AM"],
          ["Reference", "SL-7K2M9Q"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[72px_1fr] py-2">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
