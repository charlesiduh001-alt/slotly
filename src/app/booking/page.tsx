import type { Metadata } from "next";
import { findBooking } from "@/app/actions";

export const metadata: Metadata = { title: "Find my booking" };

export default function FindBookingPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
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
