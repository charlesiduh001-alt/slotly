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

export async function generateMetadata({ params }: PageProps<"/booking/[reference]">): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Booking ${reference.toUpperCase()}`,
    description: "Your appointment details, calendar links and cancellation options.",
    robots: { index: false, follow: false },
  };
}

export default async function BookingPage({ params, searchParams }: PageProps<"/booking/[reference]">) {
  const { reference } = await params;
  const sp = await searchParams;
  const result = await getBookingByReference(reference);
  if (!result) notFound();

  const { booking, service } = result;
  const now = nowInBusinessTz();
  const isPast = booking.date < now.date || (booking.date === now.date && booking.startMin <= now.minutes);
  const cancelled = booking.status === "cancelled";
  const justBooked = Boolean(sp.new) && !cancelled;
  const upcoming = !cancelled && !isPast;

  const event = {
    uid: booking.reference,
    title: `${service.name} at ${business.name}`,
    description: `Booking reference: ${booking.reference}`,
    location: business.address,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
  };

  const heading = cancelled
    ? "This booking is cancelled"
    : isPast
      ? "This appointment has passed"
      : justBooked
        ? "You're booked"
        : "Your appointment";
  const sub = cancelled
    ? "The time slot has been released. You're welcome to book another time."
    : isPast
      ? "Thanks for visiting. We hope to see you again soon."
      : `We've saved your appointment for ${formatDate(booking.date)}.`;

  return (
    <div className="container-page py-10 md:py-16">
      {justBooked && <Confetti />}
      <div className="mx-auto max-w-xl">
        {sp.cancelled && (
          <p role="status" className="mb-6 animate-rise rounded-md border border-hairline bg-surface-soft px-4 py-3 body-sm text-ink">
            Your booking has been cancelled.
          </p>
        )}
        {sp.cancelError && (
          <p role="alert" className="mb-6 animate-shake rounded-md border border-error/30 bg-error/10 px-4 py-3 body-sm text-error-text">
            We couldn&apos;t cancel that booking. Check the email address matches the one you booked with.
          </p>
        )}

        <div className="mockup-card animate-rise p-6 md:p-10">
          <div className="text-center">
            <span
              aria-hidden
              className={`mx-auto grid size-12 place-items-center rounded-full ${
                cancelled ? "bg-surface-card text-muted" : "bg-success/15 text-success-text"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {cancelled ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M5 12.5l4.5 4.5L19 7" />}
              </svg>
            </span>
            <h1 className="mt-5 display-sm">{heading}</h1>
            <p className="mt-2 body-md text-muted">{sub}</p>
          </div>

          <dl className="mt-8 divide-y divide-hairline border-y border-hairline body-sm">
            <Row label="What" value={`${service.name} · ${formatDuration(service.durationMin)}`} />
            <Row
              label="When"
              value={`${formatDate(booking.date)}, ${formatMinutes(booking.startMin)} – ${formatMinutes(booking.endMin)}`}
              strike={cancelled}
            />
            <Row label="Who" value={booking.customerName} />
            <Row label="Where" value={`${business.name}, ${business.address}`} />
            <Row label="Price" value={`${service.priceKobo ? formatPrice(service.priceKobo) : "Free"} · pay at the studio`} />
            <div className="grid grid-cols-[88px_1fr] gap-4 py-3.5">
              <dt className="text-muted">Reference</dt>
              <dd className="font-mono text-[14px] font-semibold tracking-wider text-ink">{booking.reference}</dd>
            </div>
          </dl>

          {upcoming && (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1">
                <CalendarIcon /> Google Calendar
              </a>
              <a href={`/booking/${booking.reference}/calendar`} className="btn-secondary flex-1">
                <DownloadIcon /> Download .ics
              </a>
            </div>
          )}

          {upcoming && (
            <details className="group mt-6 border-t border-hairline pt-5">
              <summary className="flex cursor-pointer list-none items-center justify-between body-sm text-muted">
                <span>
                  Need to make a change? <span className="font-semibold text-ink">Cancel booking</span>
                </span>
                <span aria-hidden className="transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <form action={cancelBookingByCustomer} className="mt-4">
                <input type="hidden" name="reference" value={booking.reference} />
                <label htmlFor="email" className="label">
                  Confirm the email you booked with
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input id="email" name="email" type="email" required autoComplete="email" className="input" />
                  <button className="btn-danger">Cancel booking</button>
                </div>
              </form>
            </details>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/book" className="btn-primary">
            Book another appointment
          </Link>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strike = false }: { label: string; value: string; strike?: boolean }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-4 py-3.5">
      <dt className="text-muted">{label}</dt>
      <dd className={`font-medium text-ink ${strike ? "line-through" : ""}`}>{value}</dd>
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
