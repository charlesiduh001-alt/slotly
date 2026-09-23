import { logout } from "@/app/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="container-page py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminTabs />
        <form action={logout}>
          <button className="btn-secondary">Log out</button>
        </form>
      </div>
      {children}
    </div>
  );
}
