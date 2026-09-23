import type { Metadata } from "next";
import Link from "next/link";
import { adminSetBookingStatus } from "@/app/actions";
import { Notice } from "@/components/notice";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { isNoticeKey } from "@/lib/notices";
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
    <div className="mt-10">
      {isNoticeKey(sp.notice) && (
        <div className="mb-6">
          <Notice notice={sp.notice} />
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="caption text-muted">{date === today ? "Today" : "Schedule"}</p>
          <h1 className="mt-1 display-xs md:display-md">{formatDate(date)}</h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Link href={`/admin?date=${addDays(date, -1)}`} className="icon-btn" aria-label="Previous day">
            <Chevron direction="left" />
          </Link>
          {date !== today && (
            <Link href="/admin" className="btn-secondary">
              Today
            </Link>
          )}
          <Link href={`/admin?date=${addDays(date, 1)}`} className="icon-btn" aria-label="Next day">
            <Chevron direction="right" />
          </Link>
          <form action="/admin" className="flex w-full gap-2 sm:ml-2 sm:w-auto">
            <label htmlFor="date" className="sr-only">
              Jump to date
            </label>
            <input id="date" type="date" name="date" defaultValue={date} className="input min-w-0 flex-1 sm:w-44 sm:flex-none" />
            <button className="btn-secondary">Go</button>
          </form>
        </div>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Confirmed bookings" value={String(confirmed.length)} />
        <Stat label="Expected revenue" value={formatPrice(revenue)} />
        <Stat label="Hours booked" value={(bookedMinutes / 60).toFixed(1)} />
      </dl>

      <div className="mt-8 overflow-hidden rounded-lg border border-hairline bg-canvas">
        {rows.length === 0 ? (
          <p className="p-12 text-center body-sm text-muted">No bookings for this day yet.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-left body-sm">
              <thead className="border-b border-hairline bg-surface-soft caption text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rows.map(({ booking: b, service: s }) => {
                  const cancelled = b.status === "cancelled";
                  return (
                    <tr key={b.id} className={cancelled ? "text-muted" : "text-body"}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`font-semibold text-ink ${cancelled ? "text-muted line-through" : ""}`}>
                          {formatMinutes(b.startMin)}
                        </span>
                        <span className="text-muted"> – {formatMinutes(b.endMin)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink">{b.customerName}</p>
                        <p className="caption text-muted">
                          <a href={`tel:${b.customerPhone.replace(/[^+0-9]/g, "")}`} className="text-link text-muted">
                            {b.customerPhone}
                          </a>
                          {" · "}
                          <a href={`mailto:${b.customerEmail}`} className="text-link text-muted">
                            {b.customerEmail}
                          </a>
                        </p>
                        {b.notes && <p className="mt-1 max-w-xs caption text-muted italic">&ldquo;{b.notes}&rdquo;</p>}
                      </td>
                      <td className="px-5 py-4">{s.name}</td>
                      <td className="px-5 py-4 font-mono text-[13px]">{b.reference}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${cancelled ? "bg-error/10 text-error-text" : "bg-success/10 text-success-text"}`}>
                          {cancelled ? "Cancelled" : "Confirmed"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <form action={adminSetBookingStatus}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value={cancelled ? "confirmed" : "cancelled"} />
                          <button className={`${cancelled ? "btn-secondary" : "btn-danger"} h-9 px-3`}>
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
    <div className="flex flex-col-reverse rounded-lg bg-surface-card p-6">
      <dt className="mt-1 caption text-body">{label}</dt>
      <dd className="display-sm">{value}</dd>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}
