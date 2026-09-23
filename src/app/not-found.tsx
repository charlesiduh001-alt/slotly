import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Book an appointment or look up your booking instead.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="container-page section text-center">
      <span className="badge">404</span>
      <h1 className="mt-5 display-xs sm:display-lg">This chair is empty</h1>
      <p className="mx-auto mt-4 max-w-md body-md text-muted">
        We couldn&apos;t find that page. If you followed a booking link, check the reference and try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/book" className="btn-primary">
          Book an appointment
        </Link>
        <Link href="/booking" className="btn-secondary">
          Find my booking
        </Link>
      </div>
      <Link href="/" className="btn-text mt-6 text-muted">
        <span aria-hidden>←</span> Back to home
      </Link>
    </section>
  );
}
