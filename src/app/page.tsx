import Link from "next/link";
import { Suspense } from "react";
import { BookingDemo, Testimonials } from "@/components/landing";
import { AnimatedHeadline } from "@/components/headline";
import { CountUp, Reveal, TiltCard } from "@/components/motion";
import { NextAvailableCard } from "@/components/next-available-card";
import { business, DAY_NAMES } from "@/lib/business";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActiveServices, getBusinessHours } from "@/lib/queries";
import { formatMinutes } from "@/lib/time";

// Demo content for the fictional salon (the site banner says so).
const STATS = [
  { to: 2400, suffix: "+", label: "Happy clients" },
  { to: 4.9, decimals: 1, suffix: "★", label: "Average rating" },
  { to: 8, label: "Years in Lekki" },
  { to: 45, suffix: "s", label: "Average time to book" },
];

const TESTIMONIALS = [
  {
    quote: "I booked my silk press at midnight from my bed. No more waiting for someone to reply on WhatsApp!",
    name: "Temi A.",
    detail: "Silk Press",
  },
  {
    quote: "Having a reference number made cancelling and rebooking so easy. It feels like booking with a big brand.",
    name: "Kelechi O.",
    detail: "Men's Cut & Line-up",
  },
  {
    quote: "Four-hour braids and they knew exactly when I was coming. Smoothest salon experience in Lagos.",
    name: "Halima B.",
    detail: "Knotless Braids",
  },
];

export default async function Home() {
  const [services, hours] = await Promise.all([getActiveServices(), getBusinessHours()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-[-10%] size-[560px] animate-drift rounded-full bg-plum-100/70 blur-3xl" />
          <div className="absolute top-40 left-[-15%] size-[420px] animate-drift rounded-full bg-gold/10 blur-3xl [animation-delay:-9s]" />
          <div
            className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            style={{
              backgroundImage: "radial-gradient(var(--c-line) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-20 md:pb-28">
          <div>
            <div className="animate-rise">
              <p className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                Now booking · {business.tagline}
              </p>
            </div>

            <AnimatedHeadline
              text="Your next appointment, booked in"
              highlight="under a minute."
              className="mt-5 font-display text-4xl leading-[1.05] font-semibold sm:text-6xl"
            />

            <div className="animate-rise [animation-delay:0.55s]">
              <p className="mt-6 max-w-xl text-lg text-muted">
                Pick a service, choose a time that suits you and get instant confirmation. No calls, no waiting on
                WhatsApp replies.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/book" className="btn-primary group px-7 py-3 text-base">
                  Book an appointment
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link href="#services" className="btn-secondary px-7 py-3 text-base">
                  View services
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-3 text-sm text-muted">
                <div className="flex -space-x-2" aria-hidden>
                  {["TA", "KO", "HB", "AN"].map((initials, i) => (
                    <span
                      key={initials}
                      className="grid size-8 place-items-center rounded-full border-2 border-cream text-[10px] font-semibold text-white"
                      style={{ background: ["#6b2d5e", "#8a5d16", "#2f7a55", "#8f3f7c"][i] }}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <span>
                  <strong className="text-ink">4.9★</strong> from 380+ reviews
                </span>
              </div>
            </div>
          </div>

          <div className="animate-rise [animation-delay:0.35s]">
            <div className="animate-float [animation-delay:1.2s]">
              <Suspense fallback={<CardSkeleton />}>
                <NextAvailableCard />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-surface/60">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="flex flex-col-reverse text-center">
              <dt className="mt-1 text-sm text-muted">{s.label}</dt>
              <dd className="font-display text-3xl font-semibold text-accent sm:text-4xl">
                <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal>
          <p className="eyebrow">Services</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">What we offer</h2>
          <p className="mt-3 max-w-xl text-muted">Transparent prices and timings. Tap any service to see live availability.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.08} className="h-full">
              <TiltCard className="card h-full rounded-2xl">
                <Link
                  href={`/book?service=${s.id}`}
                  className="relative flex h-full flex-col rounded-2xl p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                    <span className="shrink-0 rounded-full bg-plum-50 px-2.5 py-1 text-xs font-medium text-accent">
                      {formatDuration(s.durationMin)}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm text-muted">{s.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-lg font-semibold">{s.priceKobo ? formatPrice(s.priceKobo) : "Free"}</span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-accent">
                      Book
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden border-y border-line bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Three taps to your chair</h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <BookingDemo />
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="eyebrow text-center">Loved in Lagos</p>
          <div className="mt-6">
            <Testimonials items={TESTIMONIALS} />
          </div>
        </Reveal>
      </section>

      {/* Hours & location */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="card h-full p-8">
              <p className="eyebrow">Opening hours</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">When to find us</h2>
              <dl className="mt-6 divide-y divide-line">
                {hours.map((h) => (
                  <div key={h.dayOfWeek} className="flex justify-between py-2.5 text-sm">
                    <dt className="font-medium">{DAY_NAMES[h.dayOfWeek]}</dt>
                    <dd className={h.closed ? "text-muted" : ""}>
                      {h.closed ? "Closed" : `${formatMinutes(h.openMin)} – ${formatMinutes(h.closeMin)}`}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="h-full">
            <div className="relative h-full overflow-hidden rounded-2xl bg-plum-900 p-8 text-white">
              <div aria-hidden className="absolute -right-20 -bottom-20 size-72 rounded-full bg-gold/20 blur-3xl" />
              <div aria-hidden className="absolute -top-16 -left-10 size-56 rounded-full bg-plum-600/40 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">Visit us</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{business.name}</h2>
                <p className="mt-4 text-white/80">{business.address}</p>
                <p className="mt-1 text-white/80">{business.phone}</p>
                <p className="mt-8 max-w-sm font-display text-3xl leading-tight font-semibold">Ready for a fresh look?</p>
                <Link
                  href="/book"
                  className="btn group mt-6 bg-white px-7 py-3 text-base text-[#2e1128] shadow-xl hover:bg-[#f7eff5]"
                >
                  Book now
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 shadow-2xl shadow-plum-900/10" aria-busy="true" aria-label="Loading availability">
      <div className="h-4 w-28 animate-pulse rounded bg-sand" />
      <div className="mt-3 h-7 w-40 animate-pulse rounded bg-sand" />
      <div className="mt-6 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-xl bg-sand" />
        ))}
      </div>
      <div className="mt-5 h-11 animate-pulse rounded-xl bg-plum-50" />
    </div>
  );
}
