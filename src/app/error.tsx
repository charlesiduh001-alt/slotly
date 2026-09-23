"use client";

import Link from "next/link";
import { useEffect } from "react";

// Shown if a page throws unexpectedly (e.g. the database is briefly unreachable).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <span aria-hidden className="mx-auto grid size-16 place-items-center rounded-full bg-danger/10 text-3xl text-danger">
        !
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-muted">
        Sorry, we couldn&apos;t load this page. Your bookings are safe. Please try again in a moment.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted">Error reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary px-6 py-3">
          Try again
        </button>
        <Link href="/" className="btn-secondary px-6 py-3">
          Back to home
        </Link>
      </div>
    </div>
  );
}
