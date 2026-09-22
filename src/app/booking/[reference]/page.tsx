import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelBookingByCustomer } from "@/app/actions";
import { business } from "@/lib/business";
import { formatDuration, formatPrice } from "@/lib/format";
import { getBookingByReference } from "@/lib/queries";
import { formatDate, formatMinutes, nowInBusinessTz } from "@/lib/time";

export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

export default async function BookingPage({ params, searchParams }: PageProps<"/booking/[reference]">) {
  const { reference } = await params;
  const sp = await searchParams;
  const result = await getBookingByReference(reference);
  if (!result) notFound();

  const { booking, service } = result;
  const now = nowInBusinessTz();
  const isPast =
    booking.date < now.date || (booking.date === now.date && booking.startMin <= now.minutes);
  const cancelled = booking.status === "cancelled";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {sp.new && !cancelled && (
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-success text-2xl text-white">
            ✓
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold">You&apos;re booked!</h1>
          <p className="mt-2 text-muted">Save your reference to manage your booking later.</p>
        </div>
      )}
      {sp.cancelled && (
        <p role="status" className="mb-6 rounded-xl border border-line bg-white px-4 py-3 text-sm">
          Your booking has been cancelled. We hope to see you another time.
        </p>
      )}
      {sp.cancelError && (
        <p role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          We couldn&apos;t cancel that booking. Check the email address matches the one you booked with.
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-line bg-sand/40 px-6 py-4">
          <div>
            <p className="text-xs text-muted">Booking reference</p>
            <p className="font-mono text-lg font-semibold tracking-wider">{booking.reference}</p>
          </div>
          <StatusBadge status={cancelled ? "Cancelled" : isPast ? "Completed" : "Confirmed"} />
        </div>
        <dl className="grid gap-4 px-6 py-6 text-sm sm:grid-cols-2">
          <Item label="Service" value={service.name} />
          <Item label="Price" value={service.priceKobo ? formatPrice(service.priceKobo) : "Free"} />
          <Item label="Date" value={formatDate(booking.date)} />
          <Item
            label="Time"
            value={`${formatMinutes(booking.startMin)} – ${formatMinutes(booking.endMin)} (${formatDuration(service.durationMin)})`}
          />
          <Item label="Name" value={booking.customerName} />
          <Item label="Where" value={business.address} />
        </dl>
      </div>

      {!cancelled && !isPast && (
        <details className="card mt-6 p-6">
          <summary className="cursor-pointer font-semibold">Need to cancel?</summary>
          <form action={cancelBookingByCustomer} className="mt-4 space-y-3">
            <input type="hidden" name="reference" value={booking.reference} />
            <label htmlFor="email" className="label">
              Confirm the email you booked with
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="email" name="email" type="email" required className="input" />
              <button className="btn-danger shrink-0">Cancel booking</button>
            </div>
          </form>
        </details>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/book" className="btn-primary">
          Book another appointment
        </Link>
        <Link href="/" className="btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: "Confirmed" | "Cancelled" | "Completed" }) {
  const styles = {
    Confirmed: "bg-success/10 text-success",
    Cancelled: "bg-danger/10 text-danger",
    Completed: "bg-sand text-muted",
  }[status];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{status}</span>;
}
