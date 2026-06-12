import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { AdminRole } from "@/types/domain";

const adminRoles = new Set<AdminRole>(["super_admin", "admin", "moderator"]);

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return Boolean(role && adminRoles.has(role as AdminRole));
}

export async function getCurrentAdmin() {
  if (!hasSupabaseEnv()) {
    return {
      id: "dev-admin",
      email: "admin@example.local",
      display_name: "Development Admin",
      role: "super_admin" as AdminRole,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,display_name,role")
    .eq("id", user.id)
    .single();

  if (!profile || !isAdminRole(profile.role)) return null;
  return profile;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
