import { notFound } from "next/navigation";
import { addTournamentParticipant, generateTournamentFixtures, updateRecord } from "@/lib/actions/admin-records";
import { getAdminTournamentDetail } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/badge";

export default async function AdminTournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getAdminTournamentDetail(id);
  if (!detail.tournament) notFound();

  const assignedIds = new Set(detail.tournamentParticipants.map((row) => row.participant_id));
  const availableParticipants = detail.participants.filter((participant) => !assignedIds.has(participant.id));
  const updateTournament = updateRecord.bind(null, "tournaments", id);
  const addParticipant = addTournamentParticipant.bind(null, id);
  const generateFixtures = generateTournamentFixtures.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#39ff88]">Tournament manager</p>
        <h1 className="text-3xl font-black text-white">{detail.tournament.name}</h1>
        <p className="mt-2 text-[#9fb6a7]">Edit tournament fields, add participants, and auto-generate fixtures.</p>
      </div>

      {query.success ? <p className="rounded-md border border-[#39ff88]/40 bg-[#12381f] p-3 text-sm text-[#b9f7ca]">Action completed: {query.success}</p> : null}
      {query.error ? <p className="rounded-md border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{query.error}</p> : null}

      <Card>
        <CardHeader><CardTitle>Edit tournament fields</CardTitle></CardHeader>
        <CardContent>
          <form action={updateTournament} className="grid gap-4 md:grid-cols-2">
            <Field label="Name"><Input name="name" required defaultValue={detail.tournament.name} /></Field>
            <Field label="Slug"><Input name="slug" required defaultValue={detail.tournament.slug} /></Field>
            <div className="md:col-span-2"><Field label="Description"><Textarea name="description" required defaultValue={detail.tournament.description} /></Field></div>
            <Field label="Cover image URL"><Input name="cover_image_url" type="url" defaultValue={detail.tournament.cover_image_url ?? ""} /></Field>
            <Field label="Format"><Input name="format" required defaultValue={detail.tournament.format} /></Field>
            <div className="md:col-span-2"><Field label="Rules"><Textarea name="rules" required defaultValue={detail.tournament.rules} /></Field></div>
            <Field label="Start date"><Input name="start_date" type="datetime-local" required defaultValue={toDateInput(detail.tournament.start_date)} /></Field>
            <Field label="End date"><Input name="end_date" type="datetime-local" required defaultValue={toDateInput(detail.tournament.end_date)} /></Field>
            <Field label="Registration URL"><Input name="registration_url" type="url" defaultValue={detail.tournament.registration_url ?? ""} /></Field>
            <Field label="Maximum participants"><Input name="maximum_participants" type="number" min="1" defaultValue={String(detail.tournament.maximum_participants ?? "")} /></Field>
            <Field label="Status">
              <Select name="status" required defaultValue={detail.tournament.status}>
                {["Draft", "Upcoming", "Ongoing", "Completed", "Cancelled", "Archived"].map((status) => <option key={status}>{status}</option>)}
              </Select>
            </Field>
            <label className="mt-7 flex items-center gap-2 text-sm text-[#cde8d4]">
              <input name="is_published" type="checkbox" value="true" defaultChecked={detail.tournament.is_published} /> Published
            </label>
            <div className="md:col-span-2"><Button type="submit">Save tournament</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add participant</CardTitle></CardHeader>
        <CardContent>
          <form action={addParticipant} className="grid gap-4 md:grid-cols-4">
            <Field label="Participant">
              <Select name="participant_id" required>
                <option value="">Select participant</option>
                {availableParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id}>{participant.display_name} {participant.ea_id ? `(${participant.ea_id})` : ""}</option>
                ))}
              </Select>
            </Field>
            <Field label="Group"><Input name="group_name" placeholder="Group A" /></Field>
            <Field label="Seed number"><Input name="seed_number" type="number" min="1" /></Field>
            <div className="mt-7"><Button type="submit">Add participant</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Auto-generate fixtures</CardTitle></CardHeader>
        <CardContent>
          <form action={generateFixtures} className="grid gap-4 md:grid-cols-3">
            <Field label="First fixture time"><Input name="start_at" type="datetime-local" required /></Field>
            <Field label="Round name"><Input name="round_name" defaultValue="League match" /></Field>
            <div className="mt-7"><Button type="submit" variant="secondary">Generate round robin fixtures</Button></div>
          </form>
          <p className="mt-3 text-sm text-[#8fa298]">This creates one scheduled fixture for every participant pair in this tournament.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {detail.tournamentParticipants.map((row) => (
              <div key={row.id} className="rounded-md border border-[#1d3326] p-3">
                <p className="font-semibold text-white">{row.participant?.display_name ?? row.participant_id}</p>
                <p className="text-sm text-[#9fb6a7]">Group {row.group_name ?? "-"} · Seed {row.seed_number ?? "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fixtures linked to this tournament</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {detail.fixtures.map((fixture) => (
              <div key={fixture.id} className="rounded-md border border-[#1d3326] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-white">{fixture.home_participant?.display_name ?? fixture.home_participant_id} vs {fixture.away_participant?.display_name ?? fixture.away_participant_id}</p>
                  <StatusBadge status={fixture.status} />
                </div>
                <p className="mt-1 text-sm text-[#9fb6a7]">Matchday {fixture.matchday ?? "-"} · {fixture.round_name ?? "-"} · {formatDateTime(fixture.scheduled_at)}</p>
              </div>
            ))}
            {!detail.fixtures.length ? <p className="text-sm text-[#9fb6a7]">No fixtures generated yet.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 16) : "";
}
