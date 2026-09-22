import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Staff login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Staff login</h1>
      <p className="mt-2 text-sm text-muted">Manage bookings and services.</p>
      <LoginForm />
    </div>
  );
}
