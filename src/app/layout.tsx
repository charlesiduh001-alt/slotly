import type { Metadata, Viewport } from "next";
import { Cal_Sans, Inter } from "next/font/google";
import Link from "next/link";
import { BrandMark } from "@/components/booker";
import { InlineScript } from "@/components/inline-script";
import { MobileMenu, type NavLink } from "@/components/mobile-menu";
import { MotionProvider } from "@/components/motion";
import { ThemeToggle, themeScript } from "@/components/theme-toggle";
import { business, SITE_URL } from "@/lib/business";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Cal Sans ships a single weight, drawn as the display weight.
const calSans = Cal_Sans({ variable: "--font-cal-sans", weight: "400", subsets: ["latin"] });

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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const NAV: NavLink[] = [
  { href: "/#services", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#visit", label: "Visit" },
];

const telHref = `tel:${business.phone.replace(/\s/g, "")}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${calSans.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-canvas focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <div className="border-b border-hairline-soft bg-surface-soft px-4 py-2 text-center caption text-muted">
            Demo site: {business.name} is a fictional salon showcasing{" "}
            <a href={business.repoUrl} className="font-semibold text-ink underline underline-offset-2">
              Slotly
            </a>
            . Bookings aren&apos;t real appointments.
          </div>

          <header className="sticky top-0 z-40 border-b border-hairline-soft bg-canvas">
            <div className="container-page flex h-16 items-center justify-between gap-4">
              <Link href="/" aria-label={`${business.name} home`} className="flex min-w-0 items-center gap-2.5 rounded-md">
                <BrandMark />
                <span className="truncate font-display text-[20px] tracking-[-0.3px] text-ink">{business.name}</span>
              </Link>

              <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                {NAV.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 nav-link text-ink">
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <Link href="/booking" className="btn-text hidden px-2 md:inline-flex">
                  My booking
                </Link>
                <div className="hidden md:block">
                  <ThemeToggle />
                </div>
                <Link href="/book" className="btn-primary">
                  Book now
                </Link>
                <MobileMenu
                  links={[...NAV, { href: "/booking", label: "My booking" }, { href: "/admin", label: "Staff login" }]}
                  phone={business.phone}
                  email={business.email}
                />
              </div>
            </div>
          </header>

          <main id="main" className="flex-1">
            {children}
          </main>

          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}

/** Dark footer: the only dark surface, closing every page (spec: footer). */
function Footer() {
  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: "Book",
      links: [
        { href: "/book", label: "Book an appointment" },
        { href: "/booking", label: "Find my booking" },
        { href: "/#services", label: "Services & prices" },
      ],
    },
    {
      title: "Salon",
      links: [
        { href: "/#how-it-works", label: "How it works" },
        { href: "/#reviews", label: "Reviews" },
        { href: "/#visit", label: "Opening hours" },
      ],
    },
    {
      title: "Staff",
      links: [
        { href: "/admin", label: "Staff login" },
        { href: business.repoUrl, label: "About Slotly" },
      ],
    },
  ];

  return (
    <footer className="bg-surface-dark text-on-dark-soft">
      <div className="container-page grid gap-10 py-16 body-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-md">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-on-dark font-display text-[18px] text-[#111111]">
              {business.name[0]}
            </span>
            <span className="font-display text-[20px] tracking-[-0.3px] text-on-dark">{business.name}</span>
          </Link>
          <p className="mt-4 max-w-xs">{business.tagline}. Book online any time, day or night.</p>
          <address className="mt-4 not-italic">{business.address}</address>
          <ul className="mt-4 space-y-1">
            <li>
              <a href={telHref} className="inline-block py-1 text-on-dark">
                {business.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="inline-block py-1 break-all text-on-dark">
                {business.email}
              </a>
            </li>
          </ul>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="caption text-on-dark">{col.title}</p>
            <ul className="mt-4 space-y-1">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-1.5 text-on-dark-soft active:text-on-dark">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-surface-dark-elevated">
        <div className="container-page flex flex-col gap-2 py-6 caption text-muted-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <p>
            Scheduling by{" "}
            <a href={business.repoUrl} className="text-on-dark-soft underline underline-offset-2">
              Slotly
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
