import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { FixtureRow } from "@/components/public/content-cards";
import { formatDate } from "@/lib/utils";
import { getTournamentDetail } from "@/lib/data/public";

export default async function TournamentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getTournamentDetail(slug);
  if (!detail) notFound();
  const { tournament, participants, fixtures, standings } = detail;
  return (
    <section className="container py-12">
      <div className="overflow-hidden rounded-lg border border-[#1d3326] bg-[#0c130f]">
        <div className="aspect-[16/6] bg-cover bg-center" style={{ backgroundImage: `url(${tournament.cover_image_url ?? ""})` }} />
        <div className="p-6 md:p-8">
          <StatusBadge status={tournament.status} />
          <h1 className="mt-4 text-4xl font-black text-white">{tournament.name}</h1>
          <p className="mt-3 max-w-3xl text-[#b5c8bc]">{tournament.description}</p>
        </div>
      </div>
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex flex-wrap gap-2">
          {["overview", "participants", "fixtures", "standings"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-md border border-[#294434] px-4 py-2 text-sm data-[state=active]:bg-[#39ff88] data-[state=active]:text-[#041006]">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <Card><CardContent className="grid gap-4 pt-5 md:grid-cols-2">
            <Info label="Format" value={tournament.format} />
            <Info label="Start" value={formatDate(tournament.start_date)} />
            <Info label="End" value={formatDate(tournament.end_date)} />
            <Info label="Max participants" value={String(tournament.maximum_participants ?? "Open")} />
            <div className="md:col-span-2"><Info label="Rules" value={tournament.rules} /></div>
            {tournament.registration_url ? <Button asChild><a href={tournament.registration_url}>Registration link</a></Button> : null}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="participants" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {participants.map((row) => (
              <Card key={row.id}><CardContent className="pt-5">
                <h3 className="font-bold text-white">{row.participant?.display_name}</h3>
                <p className="text-sm text-[#9fb6a7]">{row.participant?.team_name} · {row.participant?.platform}</p>
                <p className="mt-3 text-sm text-[#cbe5d2]">Group {row.group_name ?? "-"} · Seed {row.seed_number ?? "-"}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="fixtures" className="mt-6">
          <Card>{fixtures.map((fixture) => <FixtureRow key={fixture.id} fixture={fixture} />)}</Card>
        </TabsContent>
        <TabsContent value="standings" className="mt-6">
          <Table><thead><tr>{["Pos", "Participant", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h) => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>{standings.map((standing) => <tr key={standing.id}><Td>{standing.position}</Td><Td>{standing.participant?.display_name}</Td><Td>{standing.played}</Td><Td>{standing.won}</Td><Td>{standing.drawn}</Td><Td>{standing.lost}</Td><Td>{standing.goals_for}</Td><Td>{standing.goals_against}</Td><Td>{standing.goal_difference}</Td><Td>{standing.points}</Td></tr>)}</tbody>
          </Table>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm text-[#8fa298]">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>;
}
