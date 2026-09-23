import type { Metadata } from "next";
import { findBooking } from "@/app/actions";
import { Notice } from "@/components/notice";
import { isNoticeKey } from "@/lib/notices";

export const metadata: Metadata = {
  title: "Find my booking",
  description: "Look up your appointment with your booking reference to view, add to calendar or cancel it.",
};

export default async function FindBookingPage({ searchParams }: PageProps<"/booking">) {
  const { notice } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      {isNoticeKey(notice) && (
        <div className="mb-6">
          <Notice notice={notice} />
        </div>
      )}
      <h1 className="font-display text-3xl font-semibold">Find my booking</h1>
      <p className="mt-2 text-muted">
        Enter the reference from your confirmation (it looks like <strong>SL-7K2M9Q</strong>).
      </p>
      <form action={findBooking} className="mt-6 flex gap-2">
        <label htmlFor="reference" className="sr-only">
          Booking reference
        </label>
        <input
          id="reference"
          name="reference"
          required
          placeholder="SL-XXXXXX"
          autoCapitalize="characters"
          className="input uppercase"
        />
        <button className="btn-primary shrink-0">Find</button>
      </form>
    </div>
  );
}
