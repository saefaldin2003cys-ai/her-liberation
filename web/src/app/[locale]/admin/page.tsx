import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdmin();

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 lg:px-14">
      {authed ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
}
