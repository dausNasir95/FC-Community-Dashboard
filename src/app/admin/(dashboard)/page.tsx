import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const data = await getAdminOverview();
  const stats = [
    ["Total posters", data.totalPosters],
    ["Total tournaments", data.totalTournaments],
    ["Active tournaments", data.activeTournaments],
    ["Upcoming fixtures", data.upcomingFixtures],
    ["Total participants", data.totalParticipants],
    ["Total collections", data.totalCollections],
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Dashboard overview</h1>
        <p className="mt-2 text-[#9fb6a7]">Operational snapshot for community admins.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <Card key={label as string}><CardContent className="pt-5"><p className="text-sm text-[#8fa298]">{label}</p><p className="mt-2 text-3xl font-black text-[#39ff88]">{value}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.activity.map((activity) => (
            <div key={activity.id} className="rounded-md border border-[#1d3326] p-3 text-sm text-[#cbe5d2]">{activity.description}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
