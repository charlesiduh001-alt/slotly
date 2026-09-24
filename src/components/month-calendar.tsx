"use client";

import Link from "next/link";
import { useState } from "react";

export type CalendarDay = { date: string; available: boolean };

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );
}

function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/**
 * Month grid in the booking-widget style: available days sit on grey tiles,
 * the selected day is solid, unavailable days are plain muted text. Selection
 * updates instantly (optimistic) while the server renders that day's times.
 */
export function MonthCalendar({
  month,
  days,
  selected,
  today,
  hrefBase,
  prevHref,
  nextHref,
  compact = false,
}: {
  /** YYYY-MM */
  month: string;
  /** Bookable dates (any month); dates not listed are unavailable. */
  days: CalendarDay[];
  selected?: string;
  today: string;
  /** Day links are `${hrefBase}${date}`. */
  hrefBase: string;
  prevHref?: string;
  nextHref?: string;
  compact?: boolean;
}) {
  const [active, setActive] = useState(selected);
  const [lastSelected, setLastSelected] = useState(selected);
  if (selected !== lastSelected) {
    setLastSelected(selected);
    setActive(selected);
  }

  const available = new Set(days.filter((d) => d.available).map((d) => d.date));
  const firstWeekday = new Date(`${month}-01T00:00:00Z`).getUTCDay();
  const count = daysInMonth(month);
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <div className={compact ? "" : "mx-auto max-w-[440px]"}>
      <div className="flex items-center justify-between gap-2">
        <p className="title-sm">{monthLabel(month)}</p>
        <div className="flex gap-1">
          <MonthNav href={prevHref} label="Previous month" direction="prev" />
          <MonthNav href={nextHref} label="Next month" direction="next" />
        </div>
      </div>

      <div className={`mt-4 grid grid-cols-7 ${compact ? "gap-1" : "gap-1.5"}`} role="grid" aria-label={monthLabel(month)}>
        {WEEKDAYS.map((d) => (
          <div key={d} role="columnheader" className="pb-1 text-center text-[11px] font-medium tracking-wide text-muted">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} aria-hidden />;
          const day = Number(date.slice(-2));
          const isAvailable = available.has(date);
          const isActive = date === active;
          const isToday = date === today;
          const base = `relative flex items-center justify-center rounded-md text-[14px] ${compact ? "h-9" : "aspect-square min-h-10"}`;
          const label = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
            new Date(`${date}T00:00:00Z`),
          );

          const dot = isToday && (
            <span
              aria-hidden
              className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${isActive ? "bg-white" : "bg-accent"}`}
            />
          );

          if (!isAvailable) {
            return (
              <div key={date} role="gridcell" aria-disabled="true" className={`${base} text-muted-soft`}>
                <span className="sr-only">{label}, no availability</span>
                <span aria-hidden>{day}</span>
                {dot}
              </div>
            );
          }
          return (
            <div key={date} role="gridcell">
              <Link
                href={`${hrefBase}${date}`}
                scroll={false}
                onClick={() => setActive(date)}
                aria-current={date === selected ? "date" : undefined}
                aria-label={`${label}, available`}
                className={`${base} font-semibold transition-colors ${
                  isActive ? "bg-accent-fill text-white" : "bg-surface-card text-ink active:bg-surface-strong"
                }`}
              >
                {day}
                {dot}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthNav({ href, label, direction }: { href?: string; label: string; direction: "prev" | "next" }) {
  const icon = (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
  if (!href) {
    return (
      <span aria-hidden className="grid size-8 place-items-center rounded-md text-muted-soft opacity-50">
        {icon}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} aria-label={label} className="grid size-8 place-items-center rounded-md text-ink active:bg-surface-card">
      {icon}
    </Link>
  );
}
