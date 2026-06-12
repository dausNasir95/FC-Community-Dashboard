import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOutAdmin } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/permissions/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen lg:flex">
      <AdminSidebar />
      <main className="flex-1">
        <header className="flex min-h-16 items-center justify-between border-b border-[#1d3326] px-5">
          <div>
            <p className="text-sm text-[#8fa298]">Signed in as</p>
            <p className="font-semibold text-white">{admin.display_name ?? admin.email}</p>
          </div>
          <form action={signOutAdmin}>
            <button className="rounded-md border border-[#294434] px-3 py-2 text-sm text-[#cbe5d2] hover:bg-[#102016]">Log out</button>
          </form>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
