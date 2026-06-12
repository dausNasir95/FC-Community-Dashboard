import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/table";
import { listAdminTable } from "@/lib/data/admin";

export default async function AdminStandingsPage() {
  const data = await listAdminTable("standings");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Standings</h1>
        <p className="mt-2 text-[#9fb6a7]">Manual standings management with a recalculation service available in code.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Standings table</CardTitle>
          <Button variant="secondary">Recalculate from completed fixtures</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <thead><tr>{["Position", "Participant", "P", "W", "D", "L", "GF", "GA", "GD", "Manual", "Pts"].map((h) => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>{(data.rows as Record<string, unknown>[]).map((row) => <tr key={String(row.id)}><Td>{String(row.position ?? "")}</Td><Td>{String(row.participant_id ?? "")}</Td><Td>{String(row.played ?? 0)}</Td><Td>{String(row.won ?? 0)}</Td><Td>{String(row.drawn ?? 0)}</Td><Td>{String(row.lost ?? 0)}</Td><Td>{String(row.goals_for ?? 0)}</Td><Td>{String(row.goals_against ?? 0)}</Td><Td>{String(row.goal_difference ?? 0)}</Td><Td>{String(row.manual_adjustment ?? 0)}</Td><Td>{String(row.points ?? 0)}</Td></tr>)}</tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
