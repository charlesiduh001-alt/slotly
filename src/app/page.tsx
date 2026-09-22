import Link from "next/link";
import { business, DAY_NAMES } from "@/lib/business";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActiveServices, getBusinessHours } from "@/lib/queries";
import { formatMinutes } from "@/lib/time";

export default async function Home() {
  const [services, hours] = await Promise.all([getActiveServices(), getBusinessHours()]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 size-[520px] rounded-full bg-plum-100/60 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <p className="eyebrow">{business.tagline}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl">
              Your next appointment, booked in under a minute.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Pick a service, choose a time that suits you and get instant confirmation. No calls, no
              waiting on WhatsApp replies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="btn-primary px-7 py-3 text-base">
                Book an appointment
              </Link>
              <Link href="#services" className="btn-secondary px-7 py-3 text-base">
                View services
              </Link>
            </div>
          </div>

          <div className="card relative p-6 shadow-xl shadow-plum-900/5" aria-hidden>
            <p className="text-sm font-medium text-muted">Next available</p>
            <p className="mt-1 font-display text-2xl font-semibold">Silk Press</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM"].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-xl border px-3 py-2 text-center text-sm font-medium ${
                    i === 2
                      ? "border-plum-600 bg-plum-600 text-white"
                      : "border-line text-ink"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-plum-50 p-3 text-sm">
              <span className="grid size-8 place-items-center rounded-full bg-success text-white">✓</span>
              <span>
                <strong>Booking confirmed</strong> — ref SL-7K2M9Q
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <p className="eyebrow">Services</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">What we offer</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.id} className="card flex flex-col p-6 transition hover:shadow-lg hover:shadow-plum-900/5">
              <h3 className="font-display text-xl font-semibold">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{s.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold">{s.priceKobo ? formatPrice(s.priceKobo) : "Free"}</span>
                  <span className="text-muted"> · {formatDuration(s.durationMin)}</span>
                </div>
                <Link href={`/book?service=${s.id}`} className="btn-secondary px-4 py-2">
                  Book
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Three quick steps</h2>
            <ol className="mt-6 space-y-5">
              {[
                ["Choose a service", "See prices and how long each one takes up front."],
                ["Pick a time", "Only genuinely free slots are shown, updated live."],
                ["Get confirmed", "You'll get a booking reference you can use to manage or cancel."],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-plum-50 font-semibold text-plum-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="eyebrow">Opening hours</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">When to find us</h2>
            <dl className="card mt-6 divide-y divide-line">
              {hours.map((h) => (
                <div key={h.dayOfWeek} className="flex justify-between px-5 py-3 text-sm">
                  <dt className="font-medium">{DAY_NAMES[h.dayOfWeek]}</dt>
                  <dd className={h.closed ? "text-muted" : ""}>
                    {h.closed ? "Closed" : `${formatMinutes(h.openMin)} – ${formatMinutes(h.closeMin)}`}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted">
              {business.address} · {business.phone}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-plum-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready for a fresh look?</h2>
          <p className="mx-auto mt-3 max-w-md text-plum-100">
            Book online any time, day or night. It takes less than a minute.
          </p>
          <Link href="/book" className="btn mt-7 bg-white px-7 py-3 text-base text-plum-900 hover:bg-plum-50">
            Book now
          </Link>
        </div>
      </section>
    </>
  );
}
