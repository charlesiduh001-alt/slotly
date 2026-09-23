import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/booker";
import { LoginForm } from "@/components/login-form";
import { Notice } from "@/components/notice";
import { isAdmin } from "@/lib/auth";
import { isNoticeKey } from "@/lib/notices";

export const metadata: Metadata = {
  title: "Staff login",
  description: "Sign in to manage bookings and services.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const { notice } = await searchParams;
  return (
    <div className="container-page section">
      <div className="mx-auto max-w-sm">
        {isNoticeKey(notice) && (
          <div className="mb-6">
            <Notice notice={notice} />
          </div>
        )}
        <div className="outline-card p-8">
          <BrandMark />
          <h1 className="mt-5 display-sm">Staff login</h1>
          <p className="mt-2 body-sm text-muted">Manage bookings and services.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
