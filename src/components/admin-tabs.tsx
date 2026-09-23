"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/services", label: "Services" },
];

/** Admin section switcher in the nav-pill-group style. */
export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="pill-group">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={active ? "pill-tab-active" : "pill-tab"}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
