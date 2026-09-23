import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { InlineScript } from "@/components/inline-script";
import { MobileMenu, type NavLink } from "@/components/mobile-menu";
import { MotionProvider } from "@/components/motion";
import { ThemeToggle, themeScript } from "@/components/theme-toggle";
import { business, SITE_URL } from "@/lib/business";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

const description = `Book hair, nails and grooming at ${business.name} in Lekki, Lagos. See live availability and get instant confirmation in under a minute.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${business.name} | Book hair, nails & grooming in Lekki`, template: `%s | ${business.name}` },
  description,
  applicationName: business.name,
  openGraph: {
    type: "website",
    siteName: business.name,
    locale: "en_NG",
    title: `${business.name} | Book online in under a minute`,
    description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#151012" },
  ],
};

const NAV: NavLink[] = [
  { href: "/#services", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/booking", label: "My booking" },
];

const telHref = `tel:${business.phone.replace(/\s/g, "")}`;

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
            <a href={business.repoUrl} className="font-semibold text-white underline underline-offset-2">
              Slotly
            </a>
            . Bookings aren&apos;t real appointments.
          </div>

          <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
              <Link href="/" aria-label={`${business.name} home`} className="flex min-w-0 items-center gap-2 rounded-full">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-plum-600 to-plum-900 font-display text-lg text-white shadow-md shadow-plum-600/30"
                >
                  G
                </span>
                <span className="truncate font-display text-lg font-semibold sm:text-xl">{business.name}</span>
              </Link>
              <nav aria-label="Main" className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
                {NAV.map((l) => (
                  <Link key={l.href} href={l.href} className="hidden rounded-full px-3 py-2 text-muted transition-colors hover:text-ink sm:block">
                    {l.label}
                  </Link>
                ))}
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>
                <Link href="/book" className="btn-primary px-4 whitespace-nowrap sm:px-5">
                  Book now
                </Link>
                <MobileMenu links={[...NAV, { href: "/admin", label: "Staff login" }]} phone={business.phone} email={business.email} />
              </nav>
            </div>
          </header>

          <main id="main" className="flex-1">
            {children}
          </main>

          <footer className="border-t border-line bg-sand/50">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
              <div>
                <Link href="/" className="inline-flex items-center gap-2 rounded-full">
                  <span aria-hidden className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-plum-600 to-plum-900 font-display text-lg text-white">
                    G
                  </span>
                  <span className="font-display text-lg font-semibold">{business.name}</span>
                </Link>
                <p className="mt-3 max-w-xs text-sm text-muted">{business.tagline}. Book online any time, day or night.</p>
                <address className="mt-4 text-sm text-muted not-italic">{business.address}</address>
              </div>

              <nav aria-label="Footer">
                <p className="text-xs font-semibold tracking-[0.18em] text-ink uppercase">Explore</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {[{ href: "/book", label: "Book an appointment" }, ...NAV, { href: "/admin", label: "Staff login" }].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="inline-block py-1.5 text-muted transition-colors hover:text-accent">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-ink uppercase">Contact</p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>
                    <a href={telHref} className="inline-flex items-center gap-2 py-1.5 text-muted transition-colors hover:text-accent">
                      <PhoneIcon /> {business.phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 py-1.5 break-all text-muted transition-colors hover:text-accent">
                      <MailIcon /> {business.email}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-line">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>
                  © {new Date().getFullYear()} {business.name}. All rights reserved.
                </p>
                <p>
                  Scheduling by{" "}
                  <a href={business.repoUrl} className="font-semibold text-accent underline-offset-4 hover:underline">
                    Slotly
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </MotionProvider>
      </body>
    </html>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
