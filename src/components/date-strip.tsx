"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

export type DateOption = {
  date: string;
  weekday: string;
  day: string;
  month: string;
  label: string;
  closed: boolean;
  href: string;
};

/**
 * Horizontal date picker. The highlight slides to the tapped date straight
 * away (optimistically) while the server renders that day's times.
 */
export function DateStrip({ options, selected }: { options: DateOption[]; selected?: string }) {
  const [active, setActive] = useState(selected);
  const [lastSelected, setLastSelected] = useState(selected);
  // Follow the server when the URL changes some other way (e.g. Back button).
  if (selected !== lastSelected) {
    setLastSelected(selected);
    setActive(selected);
  }

  return (
    <div className="-mx-4 mt-4 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:thin]">
      <ul className="flex gap-2">
        {options.map((o) => {
          const isActive = o.date === active;
          const inner = (
            <>
              {isActive && (
                <motion.span
                  layoutId="date-pill"
                  className="absolute inset-0 rounded-2xl bg-plum-600 shadow-lg shadow-plum-600/25"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative text-xs">{o.weekday}</span>
              <span className="relative text-lg font-semibold">{o.day}</span>
              <span className="relative text-xs">{o.month}</span>
            </>
          );
          const base = "relative flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 text-sm transition-colors";
          return (
            <li key={o.date}>
              {o.closed ? (
                <span className={`${base} cursor-not-allowed border-line bg-sand/50 text-muted/60`} title="Closed">
                  {inner}
                </span>
              ) : (
                <Link
                  href={o.href}
                  scroll={false}
                  onClick={() => setActive(o.date)}
                  aria-current={o.date === selected ? "date" : undefined}
                  aria-label={o.label}
                  className={`${base} ${
                    isActive ? "border-transparent text-white" : "border-line bg-surface hover:-translate-y-0.5 hover:border-accent"
                  }`}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
