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
    <div className="container-page section">
      <div className="mx-auto max-w-md">
        {isNoticeKey(notice) && (
          <div className="mb-6">
            <Notice notice={notice} />
          </div>
        )}
        <div className="outline-card p-8">
          <h1 className="display-sm">Find my booking</h1>
          <p className="mt-2 body-sm text-muted">
            Enter the reference from your confirmation. It looks like{" "}
            <span className="font-mono font-semibold text-ink">SL-7K2M9Q</span>.
          </p>
          <form action={findBooking} className="mt-6">
            <label htmlFor="reference" className="label">
              Booking reference
            </label>
            <div className="flex gap-2">
              <input
                id="reference"
                name="reference"
                required
                placeholder="SL-XXXXXX"
                autoCapitalize="characters"
                autoComplete="off"
                className="input uppercase"
              />
              <button className="btn-primary">Find</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
