import type { Metadata } from "next";
import Link from "next/link";
import { DateStrip } from "@/components/date-strip";
import { Steps } from "@/components/steps";
import { formatDuration, formatPrice } from "@/lib/format";
import {
  findNextAvailable,
  getActiveServices,
  getAvailableSlots,
  getBookableDates,
  getBusinessHours,
  getService,
} from "@/lib/queries";
import { dayOfWeek, formatDate, formatMinutes } from "@/lib/time";

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

function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const sp = await searchParams;
  const serviceId = Number(param(sp.service));
  const service = Number.isInteger(serviceId) ? await getService(serviceId) : null;

  if (!service || !service.active) return <ChooseService />;

  const dates = getBookableDates();
  const requested = param(sp.date);
  const hours = await getBusinessHours();
  const closedDays = new Set(hours.filter((h) => h.closed).map((h) => h.dayOfWeek));
  const openDates = dates.filter((d) => !closedDays.has(dayOfWeek(d)));
  let date = requested && openDates.includes(requested) ? requested : undefined;
  let slots: number[] = [];
  if (date) {
    slots = await getAvailableSlots(service, date);
  } else {
    // No date chosen yet: jump to the first day that still has openings.
    const next = await findNextAvailable(service);
    date = next?.date ?? openDates[0];
    slots = next?.slots ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Steps current={2} />

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted">Selected service</p>
          <p className="font-display text-xl font-semibold">{service.name}</p>
          <p className="text-sm text-muted">
            {formatDuration(service.durationMin)} · {service.priceKobo ? formatPrice(service.priceKobo) : "Free"}
          </p>
        </div>
        <Link href="/book" className="btn-secondary">
          Change
        </Link>
      </div>

      <h1 className="mt-10 font-display text-2xl font-semibold">Choose a date</h1>
      <DateStrip
        selected={date}
        options={dates.map((d) => {
          const [weekday, day, month] = formatDate(d, "short").replace(",", "").split(" ");
          return {
            date: d,
            weekday,
            day,
            month,
            label: formatDate(d),
            closed: closedDays.has(dayOfWeek(d)),
            href: `/book?service=${service.id}&date=${d}`,
          };
        })}
      />

      {date && (
        <>
          <h2 className="mt-8 font-display text-2xl font-semibold">Available times</h2>
          <p className="mt-1 text-sm text-muted">{formatDate(date)}</p>
          {slots.length ? (
            <ul key={date} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((start, i) => (
                <li key={start} className="animate-rise" style={{ animationDelay: `${Math.min(i, 15) * 0.03}s` }}>
                  <Link
                    href={`/book/details?service=${service.id}&date=${date}&time=${start}`}
                    className="block rounded-xl border border-line bg-surface px-3 py-2.5 text-center text-sm font-medium transition hover:-translate-y-0.5 hover:border-accent hover:bg-plum-50 hover:shadow-md hover:shadow-plum-600/10 active:scale-95"
                  >
                    {formatMinutes(start)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p key={date} className="card mt-4 animate-rise p-6 text-center text-muted">
              No times left on this day. Please try another date.
            </p>
          )}
        </>
      )}
    </div>
  );
}

async function ChooseService() {
  const services = await getActiveServices();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Steps current={1} />
      <h1 className="mt-8 font-display text-3xl font-semibold">Choose a service</h1>
      <ul className="mt-6 grid gap-3">
        {services.map((s, i) => (
          <li key={s.id} className="animate-rise" style={{ animationDelay: `${i * 0.05}s` }}>
            <Link
              href={`/book?service=${s.id}`}
              className="card group flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-plum-600/5"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="mt-0.5 text-sm text-muted">{s.description}</p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="font-semibold">{s.priceKobo ? formatPrice(s.priceKobo) : "Free"}</p>
                <p className="text-muted">{formatDuration(s.durationMin)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
