import { TournamentCard } from "@/components/public/content-cards";
import { getTournaments } from "@/lib/data/public";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  const groups = ["Upcoming", "Ongoing", "Completed"] as const;
  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black text-white">Tournaments</h1>
      <p className="mt-3 text-[#9fb6a7]">Browse published competitions by status.</p>
      {groups.map((status) => (
        <div key={status} className="mt-10">
          <h2 className="mb-4 text-2xl font-bold text-white">{status}</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.filter((tournament) => tournament.status === status).map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
