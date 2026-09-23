import type { Metadata } from "next";
import Link from "next/link";
import { EventDetails } from "@/components/booker";
import { BookingForm } from "@/components/booking-form";
import { getAvailableSlots, getService } from "@/lib/queries";
import { isValidDateString } from "@/lib/time";

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
      <div className="container-page section text-center">
        <span className="badge">Time unavailable</span>
        <h1 className="mt-4 display-xs md:display-md">That time isn&apos;t available</h1>
        <p className="mx-auto mt-3 max-w-md body-md text-muted">It may have just been booked. Please pick another slot.</p>
        <Link href={service ? `/book?service=${service.id}&date=${date}` : "/book"} className="btn-primary mt-8">
          Choose another time
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-16">
      <Link href={`/book?service=${service.id}&date=${date}`} className="btn-text mb-5 text-muted">
        <span aria-hidden>←</span> Back
      </Link>
      <div className="mockup-card mx-auto grid max-w-4xl overflow-hidden md:grid-cols-[300px_1fr]">
        <div className="border-b border-hairline md:border-r md:border-b-0">
          <EventDetails service={service} date={date} startMin={startMin} />
        </div>
        <section aria-labelledby="details-heading" className="p-6 md:p-8">
          <h2 id="details-heading" className="title-lg">
            Your details
          </h2>
          <p className="mt-1 body-sm text-muted">We&apos;ll use these to confirm your appointment.</p>
          <BookingForm serviceId={service.id} date={date} startMin={startMin} />
        </section>
      </div>
    </div>
  );
}
