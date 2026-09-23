import type { Metadata } from "next";
import { adminToggleService } from "@/app/actions";
import { Notice } from "@/components/notice";
import { ServiceForm } from "@/components/service-form";
import { requireAdmin } from "@/lib/auth";
import { formatDuration, formatPrice } from "@/lib/format";
import { isNoticeKey } from "@/lib/notices";
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
    <div className="mt-10">
      {isNoticeKey(notice) && (
        <div className="mb-6">
          <Notice notice={notice} />
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="display-xs md:display-md">Services</h1>
          <p className="mt-2 body-sm text-muted">Hidden services can&apos;t be booked but keep their booking history.</p>
          <ul className="mt-6 divide-y divide-hairline rounded-lg border border-hairline bg-canvas">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className={s.active ? "" : "opacity-60"}>
                  <p className="title-sm">
                    {s.name}
                    {!s.active && <span className="badge ml-2 align-middle">Hidden</span>}
                  </p>
                  <p className="mt-0.5 body-sm text-muted">
                    {formatDuration(s.durationMin)} · {s.priceKobo ? formatPrice(s.priceKobo) : "Free"}
                  </p>
                </div>
                <form action={adminToggleService}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="active" value={String(!s.active)} />
                  <button className="btn-secondary h-9 px-4">{s.active ? "Hide" : "Show"}</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
        <aside className="h-fit rounded-lg border border-hairline bg-canvas p-6">
          <h2 className="title-lg">Add a service</h2>
          <ServiceForm />
        </aside>
      </div>
    </div>
  );
}
