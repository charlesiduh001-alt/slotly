import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { business } from "@/lib/business";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: `${business.name} — Book online`, template: `%s · ${business.name}` },
  description: `Book appointments at ${business.name} online in under a minute. Powered by Slotly.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-plum-600 font-display text-lg text-white">
                G
              </span>
              <span className="font-display text-lg font-semibold whitespace-nowrap sm:text-xl">{business.name}</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-4">
              <Link href="/#services" className="hidden px-2 py-1 text-muted hover:text-ink sm:block">
                Services
              </Link>
              <Link href="/booking" className="px-2 py-1 whitespace-nowrap text-muted hover:text-ink">
                My booking
              </Link>
              <Link href="/book" className="btn-primary px-4 whitespace-nowrap sm:px-5">
                Book now
              </Link>
            </nav>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-line bg-sand/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              © {new Date().getFullYear()} {business.name} · {business.address}
            </p>
            <p>
              Scheduling by <span className="font-semibold text-plum-700">Slotly</span> ·{" "}
              <Link href="/admin" className="underline-offset-4 hover:underline">
                Staff login
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
