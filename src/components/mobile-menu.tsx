"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./theme-toggle";

export type NavLink = { href: string; label: string };

/** Hamburger menu for small screens. Closes on Escape, link tap or outside tap. */
export function MobileMenu({ links, phone, email }: { links: NavLink[]; phone: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Close whenever the route changes.
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
    <div className="sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative grid size-10 place-items-center rounded-full border border-line bg-surface/60 text-ink active:scale-90"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {/* Portalled to <body>: the header's backdrop-filter would otherwise trap a fixed overlay inside it. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-30 bg-plum-900/30 backdrop-blur-sm sm:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                aria-hidden
              />
            )}
          </AnimatePresence>,
          document.body,
        )}

      <AnimatePresence>
        {open && (
          <>
            <motion.nav
              key="panel"
              id="mobile-menu"
              aria-label="Mobile"
              className="absolute inset-x-3 top-full mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-line bg-surface p-3 shadow-2xl shadow-plum-900/25"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium hover:bg-plum-50 active:bg-plum-50"
                    >
                      {l.label}
                      <span aria-hidden className="text-muted">→</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-line px-4 pt-3 pb-1">
                <span className="text-sm text-muted">Appearance</span>
                <ThemeToggle />
              </div>
              <div className="border-t border-line px-4 pt-3 pb-2 text-sm">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="block py-2 text-muted hover:text-accent">
                  {phone}
                </a>
                <a href={`mailto:${email}`} className="block py-2 text-muted hover:text-accent">
                  {email}
                </a>
              </div>
              <Link href="/book" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full py-3 text-base">
                Book an appointment
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
