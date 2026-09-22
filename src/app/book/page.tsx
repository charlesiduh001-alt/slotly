import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = { title: "Book an appointment" };

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
      <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2">
        <ul className="flex gap-2">
          {dates.map((d) => {
            const closed = closedDays.has(dayOfWeek(d));
            const selected = d === date;
            const [weekday, day, month] = formatDate(d, "short").replace(",", "").split(" ");
            const classes = `flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 text-sm transition ${
              selected
                ? "border-plum-600 bg-plum-600 text-white"
                : closed
                  ? "cursor-not-allowed border-line bg-sand/50 text-muted/60"
                  : "border-line bg-white hover:border-plum-600"
            }`;
            const inner = (
              <>
                <span className="text-xs">{weekday}</span>
                <span className="text-lg font-semibold">{day}</span>
                <span className="text-xs">{month}</span>
              </>
            );
            return (
              <li key={d}>
                {closed ? (
                  <span className={classes} title="Closed">
                    {inner}
                  </span>
                ) : (
                  <Link
                    href={`/book?service=${service.id}&date=${d}`}
                    className={classes}
                    aria-current={selected ? "date" : undefined}
                    aria-label={formatDate(d)}
                    scroll={false}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {date && (
        <>
          <h2 className="mt-8 font-display text-2xl font-semibold">Available times</h2>
          <p className="mt-1 text-sm text-muted">{formatDate(date)}</p>
          {slots.length ? (
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((start) => (
                <li key={start}>
                  <Link
                    href={`/book/details?service=${service.id}&date=${date}&time=${start}`}
                    className="block rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-medium transition hover:border-plum-600 hover:bg-plum-50"
                  >
                    {formatMinutes(start)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card mt-4 p-6 text-center text-muted">
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
        {services.map((s) => (
          <li key={s.id}>
            <Link
              href={`/book?service=${s.id}`}
              className="card flex items-center justify-between gap-4 p-5 transition hover:border-plum-600"
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
