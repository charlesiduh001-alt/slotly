import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { Steps } from "@/components/steps";
import { formatDuration, formatPrice } from "@/lib/format";
import { getAvailableSlots, getService } from "@/lib/queries";
import { formatDate, formatMinutes, isValidDateString } from "@/lib/time";

export const metadata: Metadata = {
  title: "Your details",
  description: "Add your name and contact details to confirm your appointment.",
  robots: { index: false },
};

export default async function DetailsPage({ searchParams }: PageProps<"/book/details">) {
  const sp = await searchParams;
  const serviceId = Number(sp.service);
  const date = String(sp.date ?? "");
  const startMin = Number(sp.time);

  const service = Number.isInteger(serviceId) ? await getService(serviceId) : null;
  const valid =
    service?.active &&
    isValidDateString(date) &&
    Number.isInteger(startMin) &&
    (await getAvailableSlots(service, date)).includes(startMin);

  if (!service || !valid) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">That time isn&apos;t available</h1>
        <p className="mt-3 text-muted">It may have just been booked. Please pick another slot.</p>
        <Link href={service ? `/book?service=${service.id}&date=${date}` : "/book"} className="btn-primary mt-6">
          Choose another time
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_320px]">
      <div>
        <Steps current={3} />
        <h1 className="mt-8 font-display text-3xl font-semibold">Your details</h1>
        <p className="mt-1 text-muted">We&apos;ll use these to confirm your appointment.</p>
        <BookingForm serviceId={service.id} date={date} startMin={startMin} />
      </div>

      <aside className="card h-fit p-6 md:sticky md:top-24">
        <p className="eyebrow">Summary</p>
        <p className="mt-3 font-display text-xl font-semibold">{service.name}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Date</dt>
            <dd className="text-right font-medium">{formatDate(date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Time</dt>
            <dd className="font-medium">
              {formatMinutes(startMin)} – {formatMinutes(startMin + service.durationMin)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Duration</dt>
            <dd className="font-medium">{formatDuration(service.durationMin)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <dt className="text-muted">Pay at the studio</dt>
            <dd className="font-semibold">{service.priceKobo ? formatPrice(service.priceKobo) : "Free"}</dd>
          </div>
        </dl>
        <Link
          href={`/book?service=${service.id}&date=${date}`}
          className="mt-4 inline-flex items-center py-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          ← Change time
        </Link>
      </aside>
    </div>
  );
}
