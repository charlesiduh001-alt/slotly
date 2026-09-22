import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelBookingByCustomer } from "@/app/actions";
import { Confetti } from "@/components/confetti";
import { business } from "@/lib/business";
import { googleCalendarUrl } from "@/lib/calendar";
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
  const justBooked = Boolean(sp.new) && !cancelled;
  const upcoming = !cancelled && !isPast;

  const calendarUrl = googleCalendarUrl({
    uid: booking.reference,
    title: `${service.name} at ${business.name}`,
    description: `Booking reference: ${booking.reference}`,
    location: business.address,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
  });

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {justBooked && <Confetti />}
      {justBooked && (
        <div className="mb-10 text-center">
          <span className="relative mx-auto grid size-16 animate-rise place-items-center rounded-full bg-success text-3xl text-white shadow-lg shadow-success/30">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-success opacity-30 [animation-iteration-count:2]" />
            ✓
          </span>
          <h1 className="mt-5 animate-rise font-display text-4xl font-semibold [animation-delay:0.1s]">
            You&apos;re booked!
          </h1>
          <p className="mt-2 animate-rise text-muted [animation-delay:0.2s]">
            See you on {formatDate(booking.date)}. Save your reference to manage your booking.
          </p>
        </div>
      )}
      {sp.cancelled && (
        <p role="status" className="mb-6 animate-rise rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          Your booking has been cancelled. We hope to see you another time.
        </p>
      )}
      {sp.cancelError && (
        <p role="alert" className="mb-6 animate-shake rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          We couldn&apos;t cancel that booking. Check the email address matches the one you booked with.
        </p>
      )}

      {/* Ticket */}
      <div className="animate-rise [animation-delay:0.3s]">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl shadow-plum-900/10">
          <div className="relative overflow-hidden bg-gradient-to-br from-plum-600 to-plum-900 px-6 py-6 text-white">
            <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.18em] text-white/70 uppercase">{business.name}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{service.name}</p>
              </div>
              <StatusBadge status={cancelled ? "Cancelled" : isPast ? "Completed" : "Confirmed"} />
            </div>
          </div>

          {/* Perforation */}
          <div aria-hidden className="relative h-6">
            <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full border border-line bg-cream" />
            <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full border border-line bg-cream" />
            <span className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-line" />
          </div>

          <dl className="grid gap-5 px-6 pt-2 pb-6 text-sm sm:grid-cols-2">
            <Item label="Date" value={formatDate(booking.date)} />
            <Item
              label="Time"
              value={`${formatMinutes(booking.startMin)} – ${formatMinutes(booking.endMin)}`}
              hint={formatDuration(service.durationMin)}
            />
            <Item label="Name" value={booking.customerName} />
            <Item label="Price" value={service.priceKobo ? formatPrice(service.priceKobo) : "Free"} hint="Pay at the studio" />
            <div className="sm:col-span-2">
              <Item label="Where" value={business.address} />
            </div>
          </dl>

          <div className="flex items-center justify-between gap-4 border-t border-dashed border-line bg-sand/40 px-6 py-4">
            <div>
              <p className="text-xs text-muted">Booking reference</p>
              <p className="font-mono text-xl font-semibold tracking-[0.2em]">{booking.reference}</p>
            </div>
            <Barcode seed={booking.reference} />
          </div>
        </div>
      </div>

      {upcoming && (
        <div className="mt-6 flex animate-rise flex-wrap gap-3 [animation-delay:0.45s]">
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <CalendarIcon /> Add to Google Calendar
          </a>
          <a href={`/booking/${booking.reference}/calendar`} className="btn-secondary">
            <DownloadIcon /> Download .ics
          </a>
        </div>
      )}

      {upcoming && (
        <details className="card group mt-6 animate-rise p-6 [animation-delay:0.5s]">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            Need to cancel?
            <span aria-hidden className="text-muted transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
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

function Item({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-medium">
        {value}
        {hint && <span className="block text-xs font-normal text-muted">{hint}</span>}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: "Confirmed" | "Cancelled" | "Completed" }) {
  const styles = {
    Confirmed: "bg-white/15 text-white ring-1 ring-white/30",
    Cancelled: "bg-[#b3362f] text-white",
    Completed: "bg-white/10 text-white/80",
  }[status];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{status}</span>;
}

/** Decorative barcode derived from the reference, so each ticket looks unique. */
function Barcode({ seed }: { seed: string }) {
  const bars = Array.from(seed.repeat(3)).map((ch, i) => ((ch.charCodeAt(0) + i * 7) % 3) + 1);
  return (
    <div aria-hidden className="flex h-10 items-stretch gap-[2px] opacity-70">
      {bars.map((w, i) => (
        <span key={i} className="bg-ink" style={{ width: w }} />
      ))}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}
