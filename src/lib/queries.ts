import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, businessHours, services } from "@/db/schema";
import { BOOKING_WINDOW_DAYS, LEAD_TIME_MIN, SLOT_STEP_MIN } from "./booking-rules";
import { addDays, dayOfWeek, generateSlots, nowInBusinessTz } from "./time";

type Db = typeof db;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export async function getActiveServices() {
  return db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.id));
}

export async function getAllServices() {
  return db.select().from(services).orderBy(asc(services.id));
}

export async function getService(id: number) {
  const [row] = await db.select().from(services).where(eq(services.id, id));
  return row ?? null;
}

export async function getBusinessHours() {
  return db.select().from(businessHours).orderBy(asc(businessHours.dayOfWeek));
}

/** Dates customers may pick from, starting today. */
export function getBookableDates(): string[] {
  const { date: today } = nowInBusinessTz();
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(today, i));
}

export function isBookableDate(date: string): boolean {
  return getBookableDates().includes(date);
}

/**
 * Available start times for a service on a date. Accepts a transaction so the
 * booking action can re-check availability atomically before inserting.
 */
export async function getAvailableSlots(
  service: { durationMin: number },
  date: string,
  conn: Db | Tx = db,
): Promise<number[]> {
  if (!isBookableDate(date)) return [];

  const [hours] = await conn
    .select()
    .from(businessHours)
    .where(eq(businessHours.dayOfWeek, dayOfWeek(date)));
  if (!hours || hours.closed) return [];

  const booked = await conn
    .select({ startMin: bookings.startMin, endMin: bookings.endMin })
    .from(bookings)
    .where(and(eq(bookings.date, date), eq(bookings.status, "confirmed")));

  const now = nowInBusinessTz();
  return generateSlots({
    openMin: hours.openMin,
    closeMin: hours.closeMin,
    durationMin: service.durationMin,
    booked,
    stepMin: SLOT_STEP_MIN,
    earliestMin: date === now.date ? now.minutes + LEAD_TIME_MIN : 0,
  });
}

/** The first bookable date with at least one free slot, and its slots. */
export async function findNextAvailable(
  service: { durationMin: number },
): Promise<{ date: string; slots: number[] } | null> {
  for (const date of getBookableDates()) {
    const slots = await getAvailableSlots(service, date);
    if (slots.length) return { date, slots };
  }
  return null;
}

export async function getBookingByReference(reference: string) {
  const [row] = await db
    .select({ booking: bookings, service: services })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.reference, reference.toUpperCase()));
  return row ?? null;
}

export async function getBookingsForDate(date: string) {
  return db
    .select({ booking: bookings, service: services })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.date, date))
    .orderBy(asc(bookings.startMin));
}
