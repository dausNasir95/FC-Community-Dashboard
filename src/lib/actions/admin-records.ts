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
  return Object.fromEntries(Array.from(formData.entries()).filter(([, value]) => value !== "")) as Record<string, unknown>;
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

export async function updateRecord(table: MutableTable, id: string, formData: FormData) {
  const admin = await requireAdmin();
  const payload = objectFromForm(formData);
  if (table === "collections") {
    payload.tournament_id = String(formData.get("tournament_id") ?? "") || null;
    payload.start_date = String(formData.get("start_date") ?? "") || null;
    payload.due_date = String(formData.get("due_date") ?? "") || null;
  }
  const parsed = schemas[table].safeParse(payload);
  const returnPath = `/admin/${table}/${id}`;
  if (!parsed.success) {
    redirect(`${returnPath}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Validation failed")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.from(table).update(parsed.data as never).eq("id", id);
    if (error) redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "update",
      entity_type: table,
      entity_id: id,
      description: `Updated ${table} record`,
    });
  }

  revalidatePath(`/admin/${table}`);
  revalidatePath(returnPath);
  redirect(`${returnPath}?success=updated`);
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

export async function addCollectionParticipant(collectionId: string, formData: FormData) {
  const admin = await requireAdmin();
  const participantId = String(formData.get("participant_id") ?? "");
  const requiredAmount = Number(formData.get("required_amount") ?? 0) / 100;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const adminNotes = String(formData.get("admin_notes") ?? "") || null;

  if (!participantId || requiredAmount < 0) {
    redirect(`/admin/collections/${collectionId}?error=${encodeURIComponent("Participant and valid required amount are required.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.from("collection_participants").insert({
      collection_id: collectionId,
      participant_id: participantId,
      required_amount: requiredAmount,
      due_date: dueDate,
      payment_status: "Unpaid",
      admin_notes: adminNotes,
    });
    if (error) redirect(`/admin/collections/${collectionId}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "participant_added",
      entity_type: "collection_participants",
      entity_id: collectionId,
      description: "Participant added to payment collection",
    });
  }

  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}?success=participant-added`);
}

export async function updateCollectionParticipant(collectionId: string, formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const requiredAmount = Number(formData.get("required_amount") ?? 0) / 100;
  const paymentStatus = String(formData.get("payment_status") ?? "Unpaid");
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const isWaived = String(formData.get("is_waived")) === "true";
  const adminNotes = String(formData.get("admin_notes") ?? "") || null;

  if (!id || requiredAmount < 0) {
    redirect(`/admin/collections/${collectionId}?error=${encodeURIComponent("Valid participant record and amount are required.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("collection_participants")
      .update({
        required_amount: requiredAmount,
        payment_status: paymentStatus,
        due_date: dueDate,
        is_waived: isWaived,
        admin_notes: adminNotes,
      })
      .eq("id", id)
      .eq("collection_id", collectionId);
    if (error) redirect(`/admin/collections/${collectionId}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "collection_participant_updated",
      entity_type: "collection_participants",
      entity_id: id,
      description: "Collection participant payment obligation updated",
    });
  }

  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}?success=participant-updated`);
}
