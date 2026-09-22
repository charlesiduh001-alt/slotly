import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { InlineScript } from "@/components/inline-script";
import { MotionProvider } from "@/components/motion";
import { ThemeToggle, themeScript } from "@/components/theme-toggle";
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
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <div className="bg-plum-900 px-4 py-1.5 text-center text-xs text-white/85">
          Demo site: {business.name} is a fictional salon showcasing{" "}
          <a href="https://github.com/charlesiduh001-alt/slotly" className="font-semibold text-white underline-offset-4 hover:underline">
            Slotly
          </a>
          . Bookings aren&apos;t real appointments.
        </div>
        <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-plum-600 to-plum-900 font-display text-lg text-white shadow-md shadow-plum-600/30">
                G
              </span>
              <span className="font-display text-lg font-semibold whitespace-nowrap sm:text-xl">{business.name}</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-4">
              <Link href="/#services" className="hidden px-2 py-1 text-muted hover:text-ink sm:block">
                Services
              </Link>
              <Link href="/booking" className="hidden px-2 py-1 whitespace-nowrap text-muted hover:text-ink sm:block">
                My booking
              </Link>
              <ThemeToggle />
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
              Scheduling by <span className="font-semibold text-accent">Slotly</span> ·{" "}
              <Link href="/booking" className="underline-offset-4 hover:underline">
                My booking
              </Link>{" "}
              ·{" "}
              <Link href="/admin" className="underline-offset-4 hover:underline">
                Staff login
              </Link>
            </p>
          </div>
        </footer>
        </MotionProvider>
      </body>
    </html>
  );
}
