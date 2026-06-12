import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FixtureRow, CollectionCard, PosterCard, TournamentCard } from "@/components/public/content-cards";
import { getHomeData } from "@/lib/data/public";

export default async function HomePage() {
  const data = await getHomeData();
  return (
    <div>
      <section className="grid-bg border-b border-[#1d3326] py-20">
        <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#39ff88]">FC26 Community</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
              FC Community Dashboard. One Community. One Dashboard. Every Match Matters.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-[#a9beb0]">
              Community FC26 ultimate team. Discover tournaments, fixtures, posters, and collections. Join the community and stay updated on all things FC26 Ultimate Team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tournaments">View tournaments</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/fixtures">Upcoming fixtures</Link>
              </Button>
            </div>
          </div>
          {data.featuredPoster ? (
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${data.featuredPoster.image_url})` }} />
              <CardContent className="pt-5">
                <p className="text-sm font-bold uppercase tracking-wide text-[#39ff88]">Featured poster</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{data.featuredPoster.title}</h2>
                <p className="mt-2 text-[#9fb6a7]">{data.featuredPoster.description}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
      <Section title="Latest posters" href="/posters">
        <div className="grid gap-5 md:grid-cols-3">
          {data.latestPosters.map((poster) => <PosterCard key={poster.id} poster={poster} />)}
        </div>
      </Section>
      <Section title="Ongoing tournaments" href="/tournaments">
        <div className="grid gap-5 md:grid-cols-2">
          {data.ongoingTournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}
        </div>
      </Section>
      <Section title="Upcoming tournaments" href="/tournaments">
        <div className="grid gap-5 md:grid-cols-2">
          {data.upcomingTournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}
        </div>
      </Section>
      <Section title="Upcoming fixtures" href="/fixtures">
        <Card>{data.upcomingFixtures.map((fixture) => <FixtureRow key={fixture.id} fixture={fixture} />)}</Card>
      </Section>
      <Section title="Recently updated collections" href="/collections">
        <div className="grid gap-5 md:grid-cols-3">
          {data.recentCollections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="container py-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#39ff88]">
          View all <ArrowRight size={16} />
        </Link>
      </div>
      {children}
    </section>
  );
}
