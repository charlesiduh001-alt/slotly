import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { Notice } from "@/components/notice";
import { isNoticeKey } from "@/lib/notices";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff login",
  description: "Sign in to manage bookings and services.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const { notice } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      {isNoticeKey(notice) && (
        <div className="mb-6">
          <Notice notice={notice} />
        </div>
      )}
      <h1 className="font-display text-3xl font-semibold">Staff login</h1>
      <p className="mt-2 text-sm text-muted">Manage bookings and services.</p>
      <LoginForm />
    </div>
  );
}
