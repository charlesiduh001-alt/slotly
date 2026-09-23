import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Book an appointment or look up your booking instead.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 size-[480px] -translate-x-1/2 animate-drift rounded-full bg-plum-100/60 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="animate-rise font-display text-[7rem] leading-none font-semibold text-gradient sm:text-[9rem]">404</p>
        <h1 className="mt-4 animate-rise font-display text-3xl font-semibold [animation-delay:0.1s]">
          This chair is empty
        </h1>
        <p className="mt-3 animate-rise text-muted [animation-delay:0.2s]">
          We couldn&apos;t find that page. If you followed a booking link, check the reference and try again.
        </p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:0.3s]">
          <Link href="/book" className="btn-primary px-6 py-3">
            Book an appointment
          </Link>
          <Link href="/booking" className="btn-secondary px-6 py-3">
            Find my booking
          </Link>
        </div>
        <Link href="/" className="mt-6 inline-flex animate-rise py-2 text-sm font-medium text-accent underline-offset-4 hover:underline [animation-delay:0.4s]">
          ← Back to home
        </Link>
      </div>
    </section>
  );
}
