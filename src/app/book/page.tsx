import type { Metadata } from "next";
import Link from "next/link";
import { EventDetails } from "@/components/booker";
import { MonthCalendar } from "@/components/month-calendar";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActiveServices, getAvailability, getService } from "@/lib/queries";
import { formatMinutes, nowInBusinessTz } from "@/lib/time";

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: PageProps<"/book">): Promise<Metadata> {
  const id = Number(param((await searchParams).service));
  const service = Number.isInteger(id) ? await getService(id) : null;
  if (!service?.active) {
    return {
      title: "Book an appointment",
      description: "Choose a service to see live availability and book online in under a minute.",
    };
  }
  const price = service.priceKobo ? formatPrice(service.priceKobo) : "Free";
  return {
    title: `Book ${service.name}`,
    description: `${service.name}: ${formatDuration(service.durationMin)}, ${price}. Pick a free time and get instant confirmation.`,
  };
}

const dayFmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const sp = await searchParams;
  const serviceId = Number(param(sp.service));
  const service = Number.isInteger(serviceId) ? await getService(serviceId) : null;
  if (!service || !service.active) return <ChooseService />;

  const availability = await getAvailability(service);
  const bookable = availability.filter((d) => d.slots.length);
  const requested = param(sp.date);
  const selectedDay = availability.find((d) => d.date === requested && d.slots.length) ?? bookable[0];
  const selected = selectedDay?.date;

  // The booking window spans at most two calendar months.
  const months = [...new Set(availability.map((d) => d.date.slice(0, 7)))];
  const requestedMonth = param(sp.month);
  const month =
    requestedMonth && months.includes(requestedMonth) ? requestedMonth : (selected ?? availability[0].date).slice(0, 7);
  const monthIndex = months.indexOf(month);
  const base = `/book?service=${service.id}`;
  const monthHref = (m: string) => `${base}&month=${m}${selected ? `&date=${selected}` : ""}`;

  return (
    <div className="container-page py-10 md:py-16">
      <Link href="/book" className="btn-text mb-5 text-muted">
        <span aria-hidden>←</span> All services
      </Link>

      <div className="mockup-card grid overflow-hidden lg:grid-cols-[300px_1fr_280px]">
        <div className="border-b border-hairline lg:border-r lg:border-b-0">
          <EventDetails service={service} />
        </div>

        <section aria-label="Choose a date" className="border-b border-hairline p-6 lg:border-r lg:border-b-0">
          <MonthCalendar
            month={month}
            days={availability.map((d) => ({ date: d.date, available: d.slots.length > 0 }))}
            selected={selected}
            today={nowInBusinessTz().date}
            hrefBase={`${base}&month=${month}&date=`}
            prevHref={monthIndex > 0 ? monthHref(months[monthIndex - 1]) : undefined}
            nextHref={monthIndex < months.length - 1 ? monthHref(months[monthIndex + 1]) : undefined}
          />
          {!bookable.length && (
            <p className="mt-6 body-sm text-muted">Fully booked for the next three weeks. Please check back soon.</p>
          )}
        </section>

        <section aria-label="Available times" className="p-6">
          {selectedDay ? (
            <>
              <p className="title-sm">
                {dayFmt(selectedDay.date, { weekday: "short" })}{" "}
                <span className="font-normal text-muted">{dayFmt(selectedDay.date, { day: "numeric", month: "short" })}</span>
              </p>
              <ul key={selectedDay.date} className="mt-4 grid max-h-[26rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-1 lg:pr-1">
                {selectedDay.slots.map((start, i) => (
                  <li key={start} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 0.025}s` }}>
                    <Link
                      href={`/book/details?service=${service.id}&date=${selectedDay.date}&time=${start}`}
                      className="btn-secondary w-full"
                    >
                      {formatMinutes(start)}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="body-sm text-muted">Pick a day to see open times.</p>
          )}
        </section>
      </div>
    </div>
  );
}

async function ChooseService() {
  const services = await getActiveServices();
  return (
    <div className="container-page section">
      <span className="badge">Step 1 of 3</span>
      <h1 className="mt-4 display-xs md:display-lg">Book an appointment</h1>
      <p className="mt-3 max-w-xl body-md text-muted">Choose a service to see live availability.</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <li key={s.id} className="animate-rise" style={{ animationDelay: `${i * 0.04}s` }}>
            <Link href={`/book?service=${s.id}`} className="outline-card flex h-full flex-col active:bg-surface-soft">
              <span className="title-md">{s.name}</span>
              <span className="mt-2 flex-1 body-sm text-muted">{s.description}</span>
              <span className="mt-5 flex items-center justify-between gap-3">
                <span className="title-sm">{s.priceKobo ? formatPrice(s.priceKobo) : "Free"}</span>
                <span className="badge">{formatDuration(s.durationMin)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
