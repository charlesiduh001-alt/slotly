import Link from "next/link";
import { connection } from "next/server";
import { formatDuration, formatPrice } from "@/lib/format";
import { findNextAvailable, getActiveServices } from "@/lib/queries";
import { addDays, formatDate, formatMinutes, nowInBusinessTz } from "@/lib/time";

const MAX_SLOTS = 6;

function relativeDay(date: string): string | null {
  const today = nowInBusinessTz().date;
  if (date === today) return "Today";
  if (date === addDays(today, 1)) return "Tomorrow";
  return null;
}

/** Live preview of the soonest open times for the first listed service. */
export async function NextAvailableCard() {
  // Availability depends on the current time, so render per request.
  await connection();

  const [service] = await getActiveServices();
  const next = service ? await findNextAvailable(service) : null;

  return (
    <div className="card relative p-6 shadow-xl shadow-plum-900/5">
      <p className="text-sm font-medium text-muted">Next available</p>

      {service && next ? (
        <>
          <p className="mt-1 font-display text-2xl font-semibold">{service.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {formatDuration(service.durationMin)} ·{" "}
            {service.priceKobo ? formatPrice(service.priceKobo) : "Free"}
          </p>

          <p className="mt-5 text-sm font-semibold">
            {relativeDay(next.date) ? (
              <>
                {relativeDay(next.date)}
                <span className="font-normal text-muted"> · {formatDate(next.date)}</span>
              </>
            ) : (
              formatDate(next.date)
            )}
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {next.slots.slice(0, MAX_SLOTS).map((start, i) => (
              <li key={start}>
                <Link
                  href={`/book/details?service=${service.id}&date=${next.date}&time=${start}`}
                  className={`block rounded-xl border px-3 py-2 text-center text-sm font-medium transition ${
                    i === 0
                      ? "border-plum-600 bg-plum-600 text-white hover:bg-plum-700"
                      : "border-line text-ink hover:border-plum-600 hover:bg-plum-50"
                  }`}
                >
                  {formatMinutes(start)}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={`/book?service=${service.id}&date=${next.date}`}
            className="mt-5 flex items-center justify-between rounded-xl bg-plum-50 px-4 py-3 text-sm font-medium text-plum-700 transition hover:bg-plum-100"
          >
            <span>
              {next.slots.length > MAX_SLOTS
                ? `See all ${next.slots.length} times`
                : "See other days"}
            </span>
            <span aria-hidden>→</span>
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 font-display text-2xl font-semibold">Fully booked right now</p>
          <p className="mt-2 text-sm text-muted">
            New slots open every day. Check the calendar for the latest availability.
          </p>
          <Link href="/book" className="btn-primary mt-5">
            View calendar
          </Link>
        </>
      )}
    </div>
  );
}
