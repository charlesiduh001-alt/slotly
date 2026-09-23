"use client";

import Link from "next/link";
import { useEffect } from "react";

// Shown if a page throws unexpectedly (e.g. the database is briefly unreachable).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page section text-center">
      <span className="badge bg-error/10 text-error-text">Something went wrong</span>
      <h1 className="mt-5 display-xs sm:display-md">We couldn&apos;t load this page</h1>
      <p className="mx-auto mt-4 max-w-md body-md text-muted">Your bookings are safe. Please try again in a moment.</p>
      {error.digest && <p className="mt-2 font-mono caption text-muted">Error reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
