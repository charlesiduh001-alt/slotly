import type { Metadata } from "next";
import { adminToggleService } from "@/app/actions";
import { ServiceForm } from "@/components/service-form";
import { Notice } from "@/components/notice";
import { isNoticeKey } from "@/lib/notices";
import { requireAdmin } from "@/lib/auth";
import { formatDuration, formatPrice } from "@/lib/format";
import { getAllServices } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Manage services",
  description: "Add services and choose which ones customers can book.",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage({ searchParams }: PageProps<"/admin/services">) {
  await requireAdmin();
  const { notice } = await searchParams;
  const services = await getAllServices();

  return (
    <div className="grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
      <div>
        {isNoticeKey(notice) && (
          <div className="mb-6">
            <Notice notice={notice} />
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold">Services</h1>
        <p className="mt-1 text-sm text-muted">Hidden services can&apos;t be booked but keep their history.</p>
        <ul className="card mt-6 divide-y divide-line">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className={s.active ? "" : "opacity-50"}>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">
                  {formatDuration(s.durationMin)} · {s.priceKobo ? formatPrice(s.priceKobo) : "Free"}
                </p>
              </div>
              <form action={adminToggleService}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="active" value={String(!s.active)} />
                <button className="btn-secondary px-4 py-1.5">{s.active ? "Hide" : "Show"}</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
      <aside className="card h-fit p-6">
        <h2 className="font-display text-xl font-semibold">Add a service</h2>
        <ServiceForm />
      </aside>
    </div>
  );
}
