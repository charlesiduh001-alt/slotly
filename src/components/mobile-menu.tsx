"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./theme-toggle";

export type NavLink = { href: string; label: string };

/**
 * Hamburger below 768px that opens a full-screen sheet under the top nav
 * (spec: "menu opens as a full-screen sheet"). Closes on Escape, link tap or
 * route change; locks page scroll while open.
 */
export function MobileMenu({ links, phone, email }: { links: NavLink[]; phone: string; email: string }) {
  const [open, setOpen] = useState(false);
  // Top of the sheet = bottom of the header (the demo banner above it scrolls away).
  const [top, setTop] = useState(64);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          const header = buttonRef.current?.closest("header");
          if (header) setTop(Math.max(0, header.getBoundingClientRect().bottom));
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="icon-btn"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.nav
                key="sheet"
                id="mobile-menu"
                aria-label="Mobile"
                className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-y-auto border-t border-hairline bg-canvas px-4 pt-4 pb-8 md:hidden"
                style={{ top }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <ul className="divide-y divide-hairline-soft">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-4 title-md active:text-muted"
                      >
                        {l.label}
                        <span aria-hidden className="text-muted">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-hairline py-4">
                  <span className="body-sm text-muted">Appearance</span>
                  <ThemeToggle />
                </div>
                <div className="border-t border-hairline py-4 body-sm">
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="block py-2 text-ink">
                    {phone}
                  </a>
                  <a href={`mailto:${email}`} className="block py-2 text-ink">
                    {email}
                  </a>
                </div>
                <Link href="/book" onClick={() => setOpen(false)} className="btn-primary mt-auto w-full">
                  Book an appointment
                </Link>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
