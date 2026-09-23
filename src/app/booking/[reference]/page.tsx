import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelBookingByCustomer } from "@/app/actions";
import { Confetti } from "@/components/confetti";
import { CopyButton } from "@/components/copy-button";
import { business } from "@/lib/business";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatDuration, formatPrice } from "@/lib/format";
import { getBookingByReference } from "@/lib/queries";
import { formatMinutes, nowInBusinessTz } from "@/lib/time";

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
      : "Keep your reference handy. You can use it to find or cancel this booking any time.";

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

          {/* Appointment summary: date tile + service, then a grid of detail tiles */}
          <div className="mt-8 overflow-hidden rounded-lg border border-hairline">
            <div className="flex items-center gap-4 p-5">
              <div
                aria-hidden
                className={`flex w-14 shrink-0 flex-col overflow-hidden rounded-md border border-hairline text-center ${cancelled ? "opacity-50" : ""}`}
              >
                <span className="bg-primary py-0.5 text-[11px] font-semibold tracking-wider text-on-primary uppercase">
                  {dateParts(booking.date).month}
                </span>
                <span className="py-1 font-display text-[24px] leading-tight text-ink">{dateParts(booking.date).day}</span>
              </div>
              <div className="min-w-0">
                <p className={`title-md ${cancelled ? "text-muted line-through" : ""}`}>{service.name}</p>
                <p className="mt-0.5 body-sm text-body">{dateParts(booking.date).weekday}</p>
                <p className="body-sm text-body">
                  <span className="whitespace-nowrap">
                    {formatMinutes(booking.startMin)} – {formatMinutes(booking.endMin)}
                  </span>
                  <span className="whitespace-nowrap text-muted"> · {formatDuration(service.durationMin)}</span>
                </p>
              </div>
            </div>

            <dl className="grid gap-px border-t border-hairline bg-hairline sm:grid-cols-2">
              <Detail icon="pin" label="Location">
                {business.name}
                <span className="block font-normal text-body">{business.address}</span>
              </Detail>
              <Detail icon="price" label="Payment">
                {service.priceKobo ? formatPrice(service.priceKobo) : "Free"}
                <span className="block font-normal text-body">Pay at the studio</span>
              </Detail>
              <Detail icon="user" label="Booked for">
                {booking.customerName}
              </Detail>
              <Detail icon="hash" label="Reference">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono tracking-wider">{booking.reference}</span>
                  <CopyButton text={booking.reference} />
                </span>
              </Detail>
            </dl>
          </div>

          {upcoming && (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full sm:flex-1">
                <CalendarIcon /> Google Calendar
              </a>
              <a href={`/booking/${booking.reference}/calendar`} className="btn-secondary w-full sm:flex-1">
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

function dateParts(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "UTC" }).format(d);
  return {
    month: fmt({ month: "short" }).slice(0, 3),
    day: fmt({ day: "numeric" }),
    weekday: fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

const DETAIL_ICONS = {
  pin: (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  price: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  hash: <path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18" />,
};

/** One tile in the booking summary grid: icon, small label, value. */
function Detail({ icon, label, children }: { icon: keyof typeof DETAIL_ICONS; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-surface-soft p-5">
      <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {DETAIL_ICONS[icon]}
      </svg>
      <div className="min-w-0">
        <dt className="caption text-muted">{label}</dt>
        <dd className="mt-1 body-sm font-medium text-ink">{children}</dd>
      </div>
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
