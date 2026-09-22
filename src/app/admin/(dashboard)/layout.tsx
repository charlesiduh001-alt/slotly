import Link from "next/link";
import { logout } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <nav className="flex gap-1 text-sm font-medium">
          <Link href="/admin" className="rounded-full px-4 py-2 hover:bg-sand">
            Bookings
          </Link>
          <Link href="/admin/services" className="rounded-full px-4 py-2 hover:bg-sand">
            Services
          </Link>
        </nav>
        <form action={logout}>
          <button className="btn-secondary px-4 py-2">Log out</button>
        </form>
      </div>
      {children}
    </div>
  );
}
