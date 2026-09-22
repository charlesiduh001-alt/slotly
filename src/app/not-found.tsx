import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">We couldn&apos;t find that</h1>
      <p className="mt-3 text-muted">
        The page or booking reference doesn&apos;t exist. Check the reference and try again.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/booking" className="btn-secondary">Find my booking</Link>
        <Link href="/" className="btn-primary">Home</Link>
      </div>
    </div>
  );
}
