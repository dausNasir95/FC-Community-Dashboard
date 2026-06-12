import Link from "next/link";
import { CalendarDays, CircleDollarSign, Users } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { formatMYR } from "@/lib/services/payments";
import type { Collection, Fixture, Poster, Tournament } from "@/types/domain";

export function PosterCard({ poster }: { poster: Poster }) {
  return (
    <Link href={`/posters/${poster.slug}`}>
      <Card className="h-full overflow-hidden transition hover:border-[#39ff88]/70">
        <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${poster.image_url})` }} />
        <CardContent className="pt-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusBadge status={poster.status} />
            {poster.is_featured ? <Badge>Featured</Badge> : null}
          </div>
          <h3 className="text-lg font-semibold text-white">{poster.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-[#9fb6a7]">{poster.description}</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-[#39ff88]">
            <CalendarDays size={15} />
            {formatDate(poster.event_date)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Link href={`/tournaments/${tournament.slug}`}>
      <Card className="h-full overflow-hidden transition hover:border-[#39ff88]/70">
        <div className="aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${tournament.cover_image_url ?? ""})` }} />
        <CardContent className="pt-5">
          <StatusBadge status={tournament.status} />
          <h3 className="mt-3 text-lg font-semibold text-white">{tournament.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-[#9fb6a7]">{tournament.description}</p>
          <div className="mt-4 flex items-center justify-between text-sm text-[#cbe5d2]">
            <span>{tournament.format}</span>
            <span>{formatDate(tournament.start_date)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.slug}`}>
      <Card className="h-full transition hover:border-[#39ff88]/70">
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={collection.status} />
            <Badge>{collection.category}</Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">{collection.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-[#9fb6a7]">{collection.description}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#17261c]">
            <div className="h-full bg-[#39ff88]" style={{ width: `${Math.min(collection.progress_percentage ?? 0, 100)}%` }} />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[#cbe5d2]">
            <p className="flex items-center gap-2 text-[#39ff88]">
              <CircleDollarSign size={15} />
              {formatMYR(collection.total_collected ?? 0)} collected
            </p>
            <p>Target: {formatMYR(collection.target_amount)}</p>
            <p>Remaining: {formatMYR(collection.remaining_amount ?? collection.target_amount)}</p>
            <p className="flex items-center gap-2">
              <Users size={15} />
              {collection.participant_count ?? 0} participants
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FixtureRow({ fixture }: { fixture: Fixture }) {
  return (
    <div className="grid gap-3 border-b border-[#14231a] p-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
      <div>
        <p className="font-semibold text-white">{fixture.home_participant?.display_name ?? "TBD"}</p>
        <p className="text-xs text-[#9fb6a7]">{fixture.tournament?.name}</p>
      </div>
      <div className="text-xl font-black text-[#39ff88]">
        {fixture.home_score ?? "-"} : {fixture.away_score ?? "-"}
      </div>
      <div className="md:text-right">
        <p className="font-semibold text-white">{fixture.away_participant?.display_name ?? "TBD"}</p>
        <p className="text-xs text-[#9fb6a7]">
          MD {fixture.matchday ?? "-"} {fixture.round_name ? `- ${fixture.round_name}` : ""}
        </p>
      </div>
      <StatusBadge status={fixture.status} />
    </div>
  );
}
