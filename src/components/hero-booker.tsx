import Link from "next/link";
import { connection } from "next/server";
import { BrandMark } from "@/components/booker";
import { MonthCalendar } from "@/components/month-calendar";
import { business } from "@/lib/business";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActiveServices, getAvailability } from "@/lib/queries";
import { formatMinutes, nowInBusinessTz } from "@/lib/time";

const MAX_SLOTS = 6;

/**
 * Hero app-mockup card: the real booking widget at small scale (live month
 * calendar, next open times and a primary action), not an illustration.
 */
export async function HeroBooker() {
  // Availability depends on the current time, so render per request.
  await connection();

  const [service] = await getActiveServices();
  if (!service) return null;
  const availability = await getAvailability(service);
  const next = availability.find((d) => d.slots.length);
  const month = (next?.date ?? availability[0].date).slice(0, 7);
  const dayLabel = next
    ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
        new Date(`${next.date}T00:00:00Z`),
      )
    : null;

  return (
    <div className="mockup-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark size="sm" />
          <div className="min-w-0">
            <p className="caption text-muted">{business.name}</p>
            <p className="truncate title-sm">{service.name}</p>
          </div>
        </div>
        <span className="badge shrink-0">
          {formatDuration(service.durationMin)} · {service.priceKobo ? formatPrice(service.priceKobo) : "Free"}
        </span>
      </div>

      <div className="px-5 pt-5">
        <MonthCalendar
          compact
          month={month}
          days={availability.map((d) => ({ date: d.date, available: d.slots.length > 0 }))}
          selected={next?.date}
          today={nowInBusinessTz().date}
          hrefBase={`/book?service=${service.id}&date=`}
        />
      </div>

      <div className="px-5 pt-5 pb-5">
        {next && dayLabel ? (
          <>
            <p className="caption text-muted">Next available · {dayLabel}</p>
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {next.slots.slice(0, MAX_SLOTS).map((start, i) => (
                <li key={start} className="animate-rise" style={{ animationDelay: `${0.3 + i * 0.04}s` }}>
                  <Link
                    href={`/book/details?service=${service.id}&date=${next.date}&time=${start}`}
                    className="btn-secondary h-9 w-full px-2 text-[13px]"
                  >
                    {formatMinutes(start)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/book?service=${service.id}&date=${next.date}`} className="btn-primary mt-4 w-full">
              {next.slots.length > MAX_SLOTS ? `See all ${next.slots.length} times` : "See other days"}
            </Link>
          </>
        ) : (
          <Link href="/book" className="btn-primary w-full">
            View calendar
          </Link>
        )}
      </div>
    </div>
  );
}
