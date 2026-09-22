// Date/time helpers. All booking times are stored as a local business date
// ("YYYY-MM-DD") plus minutes after midnight, so nothing here depends on the
// server's own timezone.

export const BUSINESS_TZ = process.env.NEXT_PUBLIC_BUSINESS_TZ ?? "Africa/Lagos";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

/** Current date and minute-of-day in the business timezone. */
export function nowInBusinessTz(now: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday */
export function dayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function formatMinutes(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function formatDate(date: string, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    ...(style === "long" ? { year: "numeric" } : {}),
  }).format(new Date(`${date}T00:00:00Z`));
}

export type TimeRange = { startMin: number; endMin: number };

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

type SlotOptions = {
  openMin: number;
  closeMin: number;
  durationMin: number;
  booked: TimeRange[];
  stepMin?: number;
  /** Earliest allowed start (e.g. "now + lead time" when the date is today). */
  earliestMin?: number;
};

/** Start times (minutes after midnight) that can fit the service without clashing. */
export function generateSlots({
  openMin,
  closeMin,
  durationMin,
  booked,
  stepMin = 30,
  earliestMin = 0,
}: SlotOptions): number[] {
  const slots: number[] = [];
  for (let start = openMin; start + durationMin <= closeMin; start += stepMin) {
    if (start < earliestMin) continue;
    const candidate = { startMin: start, endMin: start + durationMin };
    if (!booked.some((b) => overlaps(candidate, b))) slots.push(start);
  }
  return slots;
}
