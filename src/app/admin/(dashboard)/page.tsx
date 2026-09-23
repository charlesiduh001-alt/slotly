import type { Metadata } from "next";
import Link from "next/link";
import { adminSetBookingStatus } from "@/app/actions";
import { Notice } from "@/components/notice";
import { isNoticeKey } from "@/lib/notices";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getBookingsForDate } from "@/lib/queries";
import { addDays, formatDate, formatMinutes, isValidDateString, nowInBusinessTz } from "@/lib/time";

export const metadata: Metadata = {
  title: "Bookings dashboard",
  description: "Daily schedule, expected revenue and booking management for staff.",
  robots: { index: false, follow: false },
};

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const sp = await searchParams;
  const today = nowInBusinessTz().date;
  const date = typeof sp.date === "string" && isValidDateString(sp.date) ? sp.date : today;
  const rows = await getBookingsForDate(date);

  const confirmed = rows.filter((r) => r.booking.status === "confirmed");
  const revenue = confirmed.reduce((sum, r) => sum + r.service.priceKobo, 0);
  const bookedMinutes = confirmed.reduce((sum, r) => sum + r.booking.endMin - r.booking.startMin, 0);

  return (
    <div className="py-8">
      {isNoticeKey(sp.notice) && (
        <div className="mb-6">
          <Notice notice={sp.notice} />
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{date === today ? "Today" : "Schedule"}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">{formatDate(date)}</h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Link href={`/admin?date=${addDays(date, -1)}`} className="btn-secondary px-3 py-2" aria-label="Previous day">
            ←
          </Link>
          {date !== today && (
            <Link href="/admin" className="btn-secondary px-4 py-2">
              Today
            </Link>
          )}
          <Link href={`/admin?date=${addDays(date, 1)}`} className="btn-secondary px-3 py-2" aria-label="Next day">
            →
          </Link>
          <form action="/admin" className="flex w-full gap-2 sm:ml-2 sm:w-auto">
            <label htmlFor="date" className="sr-only">
              Jump to date
            </label>
            <input id="date" type="date" name="date" defaultValue={date} className="input min-w-0 flex-1 py-2 sm:flex-none" />
            <button className="btn-secondary px-4 py-2">Go</button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Confirmed bookings" value={String(confirmed.length)} />
        <Stat label="Expected revenue" value={formatPrice(revenue)} />
        <Stat label="Hours booked" value={(bookedMinutes / 60).toFixed(1)} />
      </div>

      <div className="card mt-6 overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-muted">No bookings for this day yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-sand/40 text-xs text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Ref</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ booking: b, service: s }) => {
                  const cancelled = b.status === "cancelled";
                  return (
                    <tr key={b.id} className={cancelled ? "text-muted" : ""}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`font-medium ${cancelled ? "line-through" : ""}`}>
                          {formatMinutes(b.startMin)}
                        </span>
                        <span className="text-muted"> – {formatMinutes(b.endMin)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{b.customerName}</p>
                        <p className="text-xs text-muted">
                          <a href={`tel:${b.customerPhone.replace(/[^+0-9]/g, "")}`} className="hover:underline">{b.customerPhone}</a>
                          {" · "}
                          <a href={`mailto:${b.customerEmail}`} className="hover:underline">{b.customerEmail}</a>
                        </p>
                        {b.notes && <p className="mt-1 max-w-xs text-xs italic">“{b.notes}”</p>}
                      </td>
                      <td className="px-5 py-4">{s.name}</td>
                      <td className="px-5 py-4 font-mono text-xs">{b.reference}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            cancelled ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                          }`}
                        >
                          {cancelled ? "Cancelled" : "Confirmed"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <form action={adminSetBookingStatus}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value={cancelled ? "confirmed" : "cancelled"} />
                          <button className={cancelled ? "btn-secondary px-3 py-1.5" : "btn-danger px-3 py-1.5"}>
                            {cancelled ? "Restore" : "Cancel"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
