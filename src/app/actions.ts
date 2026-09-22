"use server";

import { randomInt } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { bookings, services } from "@/db/schema";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/queries";
import { isValidDateString, overlaps } from "@/lib/time";

export type BookingFormState = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "phone" | "notes", string>>;
  values?: Record<string, string>;
};

const bookingSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  date: z.string().refine(isValidDateString, "Invalid date"),
  startMin: z.coerce.number().int().min(0).max(24 * 60),
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.email("Please enter a valid email address").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Please enter a valid phone number"),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer").optional(),
});

// No 0/O/1/I so references are easy to read out over the phone.
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newReference(): string {
  let ref = "SL-";
  for (let i = 0; i < 6; i++) ref += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return ref;
}

class SlotTakenError extends Error {}

export async function createBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const raw = Object.fromEntries(
    [...formData.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]),
  );
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<BookingFormState["fieldErrors"]>;
      if (["name", "email", "phone", "notes"].includes(key) && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      message: Object.keys(fieldErrors).length
        ? "Please fix the highlighted fields."
        : "This booking link is invalid. Please pick a time again.",
      fieldErrors,
      values: raw,
    };
  }

  const input = parsed.data;
  let reference: string;

  try {
    reference = await db.transaction(
      async (tx) => {
        const [service] = await tx
          .select()
          .from(services)
          .where(and(eq(services.id, input.serviceId), eq(services.active, true)));
        if (!service) throw new SlotTakenError();

        // Re-check inside the transaction so two people can't grab the same slot.
        const slots = await getAvailableSlots(service, input.date, tx);
        if (!slots.includes(input.startMin)) throw new SlotTakenError();

        const ref = newReference();
        await tx.insert(bookings).values({
          reference: ref,
          serviceId: service.id,
          customerName: input.name,
          customerEmail: input.email.toLowerCase(),
          customerPhone: input.phone,
          notes: input.notes || null,
          date: input.date,
          startMin: input.startMin,
          endMin: input.startMin + service.durationMin,
        });
        return ref;
      },
      { behavior: "immediate" },
    );
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return {
        message: "Sorry, that time was just taken. Please go back and choose another slot.",
        values: raw,
      };
    }
    throw err;
  }

  revalidatePath("/admin");
  redirect(`/booking/${reference}?new=1`);
}

export async function cancelBookingByCustomer(formData: FormData): Promise<void> {
  const reference = String(formData.get("reference") ?? "").toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  // Require the booking email as well as the reference, so knowing a
  // reference alone isn't enough to cancel someone else's appointment.
  const updated = await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(bookings.reference, reference),
        eq(bookings.customerEmail, email),
        eq(bookings.status, "confirmed"),
      ),
    )
    .returning({ id: bookings.id });

  revalidatePath(`/booking/${reference}`);
  revalidatePath("/admin");
  redirect(`/booking/${reference}?${updated.length ? "cancelled=1" : "cancelError=1"}`);
}

export async function findBooking(formData: FormData): Promise<void> {
  const reference = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  const normalised = reference.startsWith("SL-") ? reference : `SL-${reference}`;
  redirect(`/booking/${normalised}`);
}

// ---- Admin -----------------------------------------------------------------

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) return { error: "Incorrect password." };
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function adminSetBookingStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") === "cancelled" ? "cancelled" : "confirmed";
  if (!Number.isInteger(id)) return;

  if (status === "confirmed") {
    // Don't let a restore create a double-booking.
    const [target] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!target) return;
    const sameDay = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.date, target.date), eq(bookings.status, "confirmed")));
    if (sameDay.some((b) => b.id !== id && overlaps(b, target))) return;
  }

  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  revalidatePath("/admin");
}

export async function adminToggleService(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  if (!Number.isInteger(id)) return;
  await db.update(services).set({ active }).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/");
}

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().min(5).max(240),
  durationMin: z.coerce.number().int().min(15).max(480),
  priceNaira: z.coerce.number().int().min(0).max(10_000_000),
});

export type ServiceFormState = { error?: string; ok?: boolean };

export async function adminCreateService(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Check the fields: name, description, duration (15–480 min) and price." };
  }
  const { priceNaira, ...rest } = parsed.data;
  await db.insert(services).values({ ...rest, priceKobo: priceNaira * 100 });
  revalidatePath("/admin/services");
  revalidatePath("/");
  return { ok: true };
}
