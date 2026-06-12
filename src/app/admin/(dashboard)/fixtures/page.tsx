import { createRecord } from "@/lib/actions/admin-records";
import { getAdminFixtureRows, getAdminTournaments, listAdminTable } from "@/lib/data/admin";
import { toInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";

export default async function AdminFixturesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [fixtures, tournaments, participants] = await Promise.all([
    getAdminFixtureRows({ page: toInt(params.page), search: params.search, status: params.status }),
    getAdminTournaments(),
    listAdminTable("participants", { pageSize: 500 }),
  ]);
  const createFixture = createRecord.bind(null, "fixtures");
  const participantRows = participants.rows as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Fixtures</h1>
        <p className="mt-2 text-[#9fb6a7]">Create fixtures linked to a tournament, then manage results and status.</p>
      </div>
      {params.success ? <p className="rounded-md border border-[#39ff88]/40 bg-[#12381f] p-3 text-sm text-[#b9f7ca]">Action completed: {params.success}</p> : null}
      {params.error ? <p className="rounded-md border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{params.error}</p> : null}

      <Card>
        <CardHeader><CardTitle>Create linked fixture</CardTitle></CardHeader>
        <CardContent>
          <form action={createFixture} className="grid gap-4 md:grid-cols-3">
            <Field label="Tournament">
              <Select name="tournament_id" required>
                <option value="">Select tournament</option>
                {tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{tournament.name}</option>)}
              </Select>
            </Field>
            <Field label="Matchday"><Input name="matchday" type="number" min="1" /></Field>
            <Field label="Round"><Input name="round_name" placeholder="Group Stage" /></Field>
            <Field label="Home participant">
              <Select name="home_participant_id" required>
                <option value="">Select participant</option>
                {participantRows.map((participant) => <option key={String(participant.id)} value={String(participant.id)}>{String(participant.display_name)}</option>)}
              </Select>
            </Field>
            <Field label="Away participant">
              <Select name="away_participant_id" required>
                <option value="">Select participant</option>
                {participantRows.map((participant) => <option key={String(participant.id)} value={String(participant.id)}>{String(participant.display_name)}</option>)}
              </Select>
            </Field>
            <Field label="Scheduled at"><Input name="scheduled_at" type="datetime-local" required /></Field>
            <Field label="Home score"><Input name="home_score" type="number" min="0" /></Field>
            <Field label="Away score"><Input name="away_score" type="number" min="0" /></Field>
            <Field label="Status">
              <Select name="status" required defaultValue="Scheduled">
                {["Scheduled", "Live", "Completed", "Postponed", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
              </Select>
            </Field>
            <div className="md:col-span-3"><Button type="submit">Create fixture</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Fixtures table</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                {["Tournament", "Home", "Away", "Matchday", "Round", "Status", "Scheduled"].map((header) => <Th key={header}>{header}</Th>)}
              </tr>
            </thead>
            <tbody>
              {(fixtures.rows as Record<string, unknown>[]).map((fixture) => (
                <tr key={String(fixture.id)}>
                  <Td>{String(fixture.tournament_name ?? fixture.tournament_id)}</Td>
                  <Td>{String(fixture.home_name ?? fixture.home_participant_id)}</Td>
                  <Td>{String(fixture.away_name ?? fixture.away_participant_id)}</Td>
                  <Td>{String(fixture.matchday ?? "")}</Td>
                  <Td>{String(fixture.round_name ?? "")}</Td>
                  <Td><StatusBadge status={String(fixture.status)} /></Td>
                  <Td>{String(fixture.scheduled_at ?? "")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
