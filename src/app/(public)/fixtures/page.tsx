import { FixtureRow } from "@/components/public/content-cards";
import { Card } from "@/components/ui/card";
import { getFixtures } from "@/lib/data/public";
import { toInt } from "@/lib/utils";

export default async function FixturesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const fixtures = await getFixtures({ page: toInt(params.page), status: params.status as string | undefined, matchday: params.matchday as string | undefined, round: params.round as string | undefined });
  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black text-white">Fixtures</h1>
      <p className="mt-3 text-[#9fb6a7]">Filter by matchday, round, and status using URL query parameters.</p>
      <Card className="mt-8">{fixtures.rows.map((fixture) => <FixtureRow key={fixture.id} fixture={fixture} />)}</Card>
    </section>
  );
}
