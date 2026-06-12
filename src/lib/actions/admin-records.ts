"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/permissions/admin";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { collectionSchema, participantSchema, posterSchema, tournamentSchema, fixtureInputSchema } from "@/lib/validations/schemas";

type MutableTable = "posters" | "tournaments" | "participants" | "fixtures" | "collections";

const schemas = {
  posters: posterSchema,
  tournaments: tournamentSchema,
  participants: participantSchema,
  fixtures: fixtureInputSchema,
  collections: collectionSchema,
};

function objectFromForm(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()).filter(([, value]) => value !== ""));
}

export async function createRecord(table: MutableTable, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = schemas[table].safeParse(objectFromForm(formData));
  if (!parsed.success) {
    redirect(`/admin/${table}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Validation failed")}`);
  }
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const payload = { ...parsed.data, created_by: admin.id };
    const { data, error } = await supabase.from(table).insert(payload as never).select("id").single();
    if (error) redirect(`/admin/${table}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "create",
      entity_type: table,
      entity_id: data?.id,
      description: `Created ${table} record`,
    });
  }
  revalidatePath(`/admin/${table}`);
  redirect(`/admin/${table}?success=created`);
}

export async function archiveRecord(table: MutableTable, formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.from(table).update({ archived_at: new Date().toISOString(), status: "Archived" }).eq("id", id);
    if (error) redirect(`/admin/${table}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "archive",
      entity_type: table,
      entity_id: id,
      description: `Archived ${table} record`,
    });
  }
  revalidatePath(`/admin/${table}`);
  redirect(`/admin/${table}?success=archived`);
}

export async function togglePublished(table: "posters" | "tournaments" | "collections", formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isPublished = String(formData.get("is_published")) === "true";
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.from(table).update({ is_published: !isPublished }).eq("id", id);
    if (error) redirect(`/admin/${table}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: isPublished ? "unpublish" : "publish",
      entity_type: table,
      entity_id: id,
      description: `${isPublished ? "Unpublished" : "Published"} ${table} record`,
    });
  }
  revalidatePath(`/admin/${table}`);
  redirect(`/admin/${table}?success=updated`);
}
