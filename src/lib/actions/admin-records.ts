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
  if (table === "tournaments") {
    payload.cover_image_url = String(formData.get("cover_image_url") ?? "") || null;
    payload.registration_url = String(formData.get("registration_url") ?? "") || null;
    payload.maximum_participants = String(formData.get("maximum_participants") ?? "") || null;
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
  const requiredAmount = Number(formData.get("required_amount") ?? 0);
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
  const requiredAmount = Number(formData.get("required_amount") ?? 0);
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

export async function recordCollectionPayment(collectionId: string, formData: FormData) {
  const admin = await requireAdmin();
  const collectionParticipantId = String(formData.get("collection_participant_id") ?? "");
  const participantId = String(formData.get("participant_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const paymentDate = String(formData.get("payment_date") ?? "") || new Date().toISOString();
  const paymentMethod = String(formData.get("payment_method") ?? "Cash");
  const verificationStatus = String(formData.get("verification_status") ?? "Verified");
  const paymentReference = String(formData.get("payment_reference") ?? "") || null;
  const internalNotes = String(formData.get("internal_notes") ?? "") || null;

  if (!collectionParticipantId || !participantId || amount <= 0) {
    redirect(`/admin/collections/${collectionId}?error=${encodeURIComponent("Participant payment record and valid RM amount are required.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const isVerified = verificationStatus === "Verified";
    const { error } = await supabase.from("payments").insert({
      collection_id: collectionId,
      collection_participant_id: collectionParticipantId,
      participant_id: participantId,
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      verification_status: verificationStatus,
      verified_by: isVerified ? admin.id : null,
      verified_at: isVerified ? new Date().toISOString() : null,
      internal_notes: internalNotes,
      created_by: admin.id,
    });
    if (error) redirect(`/admin/collections/${collectionId}?error=${encodeURIComponent(error.message)}`);

    if (isVerified) {
      const [{ data: participantRow }, { data: payments }] = await Promise.all([
        supabase.from("collection_participants").select("required_amount,is_waived").eq("id", collectionParticipantId).single(),
        supabase.from("payments").select("amount").eq("collection_participant_id", collectionParticipantId).eq("verification_status", "Verified"),
      ]);
      const totalPaid = (payments ?? []).reduce((total, payment) => total + Number(payment.amount ?? 0), 0);
      const requiredAmount = Number(participantRow?.required_amount ?? 0);
      const nextStatus = participantRow?.is_waived
        ? "Waived"
        : totalPaid > requiredAmount
          ? "Overpaid"
          : totalPaid === requiredAmount && requiredAmount > 0
            ? "Paid"
            : totalPaid > 0
              ? "Partially Paid"
              : "Unpaid";
      await supabase.from("collection_participants").update({ payment_status: nextStatus }).eq("id", collectionParticipantId);
    }

    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "payment_recorded",
      entity_type: "payments",
      entity_id: collectionId,
      description: `Recorded ${verificationStatus.toLowerCase()} collection payment`,
    });
  }

  revalidatePath(`/admin/collections/${collectionId}`);
  revalidatePath("/collections");
  redirect(`/admin/collections/${collectionId}?success=payment-recorded`);
}

export async function addTournamentParticipant(tournamentId: string, formData: FormData) {
  const admin = await requireAdmin();
  const participantId = String(formData.get("participant_id") ?? "");
  const groupName = String(formData.get("group_name") ?? "") || null;
  const seedNumber = String(formData.get("seed_number") ?? "") ? Number(formData.get("seed_number")) : null;

  if (!participantId) {
    redirect(`/admin/tournaments/${tournamentId}?error=${encodeURIComponent("Participant is required.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.from("tournament_participants").insert({
      tournament_id: tournamentId,
      participant_id: participantId,
      group_name: groupName,
      seed_number: seedNumber,
    });
    if (error) redirect(`/admin/tournaments/${tournamentId}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "participant_added",
      entity_type: "tournament_participants",
      entity_id: tournamentId,
      description: "Participant added to tournament",
    });
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  redirect(`/admin/tournaments/${tournamentId}?success=participant-added`);
}

export async function generateTournamentFixtures(tournamentId: string, formData: FormData) {
  const admin = await requireAdmin();
  const startAt = String(formData.get("start_at") ?? "");
  const roundName = String(formData.get("round_name") ?? "") || "Auto generated";

  if (!startAt) {
    redirect(`/admin/tournaments/${tournamentId}?error=${encodeURIComponent("Start date is required for generated fixtures.")}`);
  }

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data: assigned, error: participantsError } = await supabase
      .from("tournament_participants")
      .select("participant_id")
      .eq("tournament_id", tournamentId)
      .order("seed_number", { ascending: true, nullsFirst: false });
    if (participantsError) redirect(`/admin/tournaments/${tournamentId}?error=${encodeURIComponent(participantsError.message)}`);

    const participantIds = (assigned ?? []).map((row) => row.participant_id).filter(Boolean);
    const fixtures = buildRoundRobinFixtures(tournamentId, participantIds, startAt, roundName, admin.id);
    if (!fixtures.length) redirect(`/admin/tournaments/${tournamentId}?error=${encodeURIComponent("At least two participants are required.")}`);

    const { error } = await supabase.from("fixtures").insert(fixtures as never);
    if (error) redirect(`/admin/tournaments/${tournamentId}?error=${encodeURIComponent(error.message)}`);
    await supabase.from("activity_logs").insert({
      admin_id: admin.id,
      action: "fixtures_generated",
      entity_type: "fixtures",
      entity_id: tournamentId,
      description: `Generated ${fixtures.length} tournament fixtures`,
    });
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath("/admin/fixtures");
  redirect(`/admin/tournaments/${tournamentId}?success=fixtures-generated`);
}

function buildRoundRobinFixtures(
  tournamentId: string,
  participantIds: string[],
  startAt: string,
  roundName: string,
  adminId: string,
) {
  const fixtures = [];
  let matchIndex = 0;
  for (let i = 0; i < participantIds.length; i += 1) {
    for (let j = i + 1; j < participantIds.length; j += 1) {
      const scheduledAt = new Date(startAt);
      scheduledAt.setHours(scheduledAt.getHours() + matchIndex);
      fixtures.push({
        tournament_id: tournamentId,
        matchday: matchIndex + 1,
        round_name: roundName,
        home_participant_id: participantIds[i],
        away_participant_id: participantIds[j],
        scheduled_at: scheduledAt.toISOString(),
        status: "Scheduled",
        created_by: adminId,
      });
      matchIndex += 1;
    }
  }
  return fixtures;
}
