import Link from "next/link";
import { Suspense } from "react";
import { AnimatedHeadline } from "@/components/headline";
import { HeroBooker } from "@/components/hero-booker";
import { BookingDemo } from "@/components/landing";
import { CountUp, Reveal } from "@/components/motion";
import { business, DAY_NAMES } from "@/lib/business";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActiveServices, getBusinessHours } from "@/lib/queries";
import { formatMinutes } from "@/lib/time";

// Demo content for the fictional salon (the site banner says so).
const STATS = [
  { to: 2400, suffix: "+", label: "Happy clients" },
  { to: 4.9, decimals: 1, label: "Average rating" },
  { to: 8, label: "Years in Lekki" },
  { to: 45, suffix: "s", label: "Average time to book" },
];

const TESTIMONIALS = [
  {
    quote: "I booked my silk press at midnight from my bed. No more waiting for someone to reply on WhatsApp.",
    name: "Temi A.",
    detail: "Silk Press",
    color: "bg-badge-orange",
  },
  {
    quote: "Having a reference number made cancelling and rebooking so easy. It feels like booking with a big brand.",
    name: "Kelechi O.",
    detail: "Men's Cut & Line-up",
    color: "bg-badge-emerald",
  },
  {
    quote: "Four-hour braids and they knew exactly when I was coming. Smoothest salon experience in Lagos.",
    name: "Halima B.",
    detail: "Knotless Braids",
    color: "bg-badge-pink",
  },
];

const AVATARS = [
  { initials: "TA", color: "bg-badge-orange" },
  { initials: "KO", color: "bg-badge-emerald" },
  { initials: "HB", color: "bg-badge-pink" },
  { initials: "AN", color: "bg-badge-violet" },
];

export default async function Home() {
  const [services, hours] = await Promise.all([getActiveServices(), getBusinessHours()]);

  return (
    <>
      {/* Hero band — white canvas, 7/5 split with the live booking widget */}
      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="badge animate-rise">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              Now booking · {business.tagline}
            </span>
            <AnimatedHeadline
              text="The easier way to book your next"
              highlight="appointment"
              className="mt-6 display-xs sm:display-lg lg:display-xl"
            />
            <p className="mt-6 max-w-xl animate-rise text-[18px] leading-[1.5] text-body [animation-delay:0.5s]">
              Pick a service, choose a time that suits you and get instant confirmation. No calls, no waiting on
              WhatsApp replies.
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:0.6s]">
              <Link href="/book" className="btn-primary">
                Book an appointment
              </Link>
              <Link href="#services" className="btn-secondary">
                View services
              </Link>
            </div>
            <div className="mt-8 flex animate-rise items-center gap-3 [animation-delay:0.7s]">
              <div className="flex -space-x-2" aria-hidden>
                {AVATARS.map((a) => (
                  <span key={a.initials} className={`avatar ${a.color} ring-2 ring-canvas`}>
                    {a.initials}
                  </span>
                ))}
              </div>
              <div>
                <Stars />
                <p className="caption text-muted">4.9 from 380+ reviews</p>
              </div>
            </div>
          </div>

          <div className="relative animate-rise [animation-delay:0.3s] lg:col-span-5">
            {/* Adire cloth under the widget: the brand's signature surface */}
            <div aria-hidden className="adire absolute top-6 -right-3 -bottom-3 left-6 rounded-xl sm:top-10 sm:-right-5 sm:-bottom-5 sm:left-10" />
            <div className="relative">
              <Suspense fallback={<BookerSkeleton />}>
                <HeroBooker />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="container-page mt-16">
          <dl className="grid grid-cols-2 gap-y-8 border-t border-hairline pt-10 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="flex flex-col-reverse">
                <dt className="mt-1 caption text-muted">{s.label}</dt>
                <dd className="display-sm">
                  <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Services — white band with light-grey feature cards */}
      <section id="services" className="section scroll-mt-16 border-t border-hairline-soft">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="badge">Services</span>
            <h2 className="mt-4 display-xs md:display-lg">What we offer</h2>
            <p className="mt-4 body-md text-muted">Transparent prices and timings. Choose a service to see live availability.</p>
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 3) * 0.06} className="h-full">
                  <Link href={`/book?service=${s.id}`} className="feature-card flex h-full flex-col active:bg-surface-strong">
                    <span aria-hidden className="grid size-10 place-items-center rounded-md bg-canvas text-ink">
                      <ServiceIcon index={i} />
                    </span>
                    <span className="mt-5 title-md">{s.name}</span>
                    <span className="mt-2 flex-1 body-sm text-body">{s.description}</span>
                    <span className="mt-6 flex items-center justify-between gap-3">
                      <span className="title-sm">{s.priceKobo ? formatPrice(s.priceKobo) : "Free"}</span>
                      <span className="badge bg-canvas">{formatDuration(s.durationMin)}</span>
                    </span>
                  </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works — light-grey band with the white product-mockup card */}
      <section id="how-it-works" className="section scroll-mt-16 bg-surface-soft">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="badge bg-canvas">How it works</span>
            <h2 className="mt-4 display-xs md:display-lg">Three steps to your chair</h2>
            <p className="mt-4 body-md text-muted">The whole booking takes less than a minute, on any phone.</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <BookingDemo />
          </Reveal>
        </div>
      </section>

      {/* Reviews — white band with light-grey testimonial cards */}
      <section id="reviews" className="section scroll-mt-16">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="badge">Reviews</span>
            <h2 className="mt-4 display-xs md:display-lg">Loved in Lagos</h2>
          </Reveal>
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal as="li" key={t.name} delay={i * 0.06} className="h-full">
                  <figure className="flex h-full flex-col rounded-lg bg-surface-card p-6">
                    <figcaption className="flex items-center gap-3">
                      <span aria-hidden className={`avatar ${t.color}`}>
                        {t.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .replace(".", "")}
                      </span>
                      <span>
                        <span className="block title-sm">{t.name}</span>
                        <span className="block caption text-body">{t.detail}</span>
                      </span>
                    </figcaption>
                    <Stars className="mt-4" />
                    <blockquote className="mt-3 flex-1 body-md text-body">&ldquo;{t.quote}&rdquo;</blockquote>
                  </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Visit — light-grey band with white outline cards */}
      <section id="visit" className="section scroll-mt-16 bg-surface-soft">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="outline-card h-full p-8">
              <h2 className="title-lg">Opening hours</h2>
              <dl className="mt-5 divide-y divide-hairline body-sm">
                {hours.map((h) => (
                  <div key={h.dayOfWeek} className="flex justify-between py-3">
                    <dt className="font-medium text-ink">{DAY_NAMES[h.dayOfWeek]}</dt>
                    <dd className={h.closed ? "text-muted" : "text-body"}>
                      {h.closed ? "Closed" : `${formatMinutes(h.openMin)} – ${formatMinutes(h.closeMin)}`}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <div className="outline-card flex h-full flex-col p-8">
              <h2 className="title-lg">Visit {business.name}</h2>
              <address className="mt-5 body-md text-body not-italic">{business.address}</address>
              <div className="mt-4 flex flex-col items-start body-md">
                <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="text-link py-1.5">
                  {business.phone}
                </a>
                <a href={`mailto:${business.email}`} className="text-link py-1.5 break-all">
                  {business.email}
                </a>
              </div>
              <p className="mt-6 body-sm text-muted">
                Walk-ins welcome when there&apos;s space, but booking online guarantees your time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA band (light) before the dark footer */}
      <section className="section">
        <div className="container-page">
          <Reveal>
            <div className="adire overflow-hidden rounded-lg p-3 md:p-0">
              {/* Solid inner panel keeps the text on plain indigo, off the pattern */}
              <div className="mx-auto max-w-xl rounded-md bg-indigo px-6 py-12 text-center md:my-12 md:rounded-lg md:px-12">
                <h2 className="display-sm text-white!">Ready for a fresh look?</h2>
                <p className="mx-auto mt-3 max-w-md body-md text-[#d6ddf5]">Book online any time, day or night. It takes less than a minute.</p>
                <Link href="/book" className="btn mt-8 bg-white text-[#111111] active:bg-[#e5e7eb]">
                  Book an appointment
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex gap-0.5 text-badge-orange ${className}`} role="img" aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

const SERVICE_ICON_PATHS = [
  // scissors, sparkle, droplet, razor/comb, hand, chat
  "M6 6a3 3 0 1 0 0 .01M6 18a3 3 0 1 0 0 .01M8.5 7.5 20 18M8.5 16.5 20 6",
  "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  "M4 7h16M6 7v10M10 7v6M14 7v10M18 7v6",
  "M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3 14a1.5 1.5 0 0 1 2.5-1.6L8 15",
  "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
];

function ServiceIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={SERVICE_ICON_PATHS[index % SERVICE_ICON_PATHS.length]} />
    </svg>
  );
}

function BookerSkeleton() {
  return (
    <div className="mockup-card p-5" aria-busy="true" aria-label="Loading availability">
      <div className="h-9 w-48 animate-pulse rounded-md bg-surface-card" />
      <div className="mt-6 grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-md bg-surface-card" />
        ))}
      </div>
      <div className="mt-5 h-10 animate-pulse rounded-md bg-surface-card" />
    </div>
  );
}
