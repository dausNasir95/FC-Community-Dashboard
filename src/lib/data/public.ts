import * as mock from "@/lib/mock-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Collection, Fixture, ListParams, Paginated, Poster, PublicParticipant, Tournament } from "@/types/domain";

function paginate<T>(rows: T[], params: ListParams = {}): Paginated<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total: rows.length, page, pageSize };
}

export async function getHomeData() {
  const [posters, tournaments, fixtures, collections] = await Promise.all([
    getPosters({ pageSize: 3 }),
    getTournaments(),
    getFixtures({ pageSize: 5 }),
    getCollections({ pageSize: 3 }),
  ]);
  return {
    featuredPoster: posters.rows.find((poster) => poster.is_featured) ?? posters.rows[0],
    latestPosters: posters.rows,
    ongoingTournaments: tournaments.filter((tournament) => tournament.status === "Ongoing"),
    upcomingTournaments: tournaments.filter((tournament) => tournament.status === "Upcoming"),
    upcomingFixtures: fixtures.rows,
    recentCollections: collections.rows,
  };
}

export async function getPosters(params: ListParams = {}) {
  if (!hasSupabaseEnv()) {
    const rows = mock.posters
      .filter((poster) => poster.is_published)
      .filter((poster) => !params.status || poster.status === params.status)
      .filter((poster) => !params.search || poster.title.toLowerCase().includes(params.search.toLowerCase()))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    return paginate(rows, params);
  }
  const supabase = await createClient();
  let query = supabase.from("posters").select("*", { count: "exact" }).eq("is_published", true).order("created_at", {
    ascending: false,
  });
  if (params.status) query = query.eq("status", params.status);
  if (params.search) query = query.ilike("title", `%${params.search}%`);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const { data, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  return { rows: (data ?? []) as Poster[], total: count ?? 0, page, pageSize };
}

export async function getPosterBySlug(slug: string) {
  if (!hasSupabaseEnv()) return mock.posters.find((poster) => poster.slug === slug && poster.is_published) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("posters").select("*").eq("slug", slug).eq("is_published", true).single();
  return data as Poster | null;
}

export async function getTournaments() {
  if (!hasSupabaseEnv()) return mock.tournaments.filter((tournament) => tournament.is_published);
  const supabase = await createClient();
  const { data } = await supabase.from("tournaments").select("*").eq("is_published", true).order("start_date");
  return (data ?? []) as Tournament[];
}

export async function getTournamentBySlug(slug: string) {
  if (!hasSupabaseEnv()) return mock.tournaments.find((tournament) => tournament.slug === slug && tournament.is_published) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("tournaments").select("*").eq("slug", slug).eq("is_published", true).single();
  return data as Tournament | null;
}

export async function getTournamentDetail(slug: string) {
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return null;
  if (!hasSupabaseEnv()) {
    const participantRows = mock.tournamentParticipants.filter((row) => row.tournament_id === tournament.id);
    return {
      tournament,
      participants: participantRows,
      fixtures: mock.fixtures.filter((fixture) => fixture.tournament_id === tournament.id),
      standings: mock.standings.filter((standing) => standing.tournament_id === tournament.id),
    };
  }
  const supabase = await createClient();
  const [{ data: participants }, { data: fixtures }, { data: standings }] = await Promise.all([
    supabase
      .from("tournament_participants")
      .select("*, participant:public_participants(*)")
      .eq("tournament_id", tournament.id),
    supabase
      .from("fixtures")
      .select("*, home_participant:public_participants!fixtures_home_participant_id_fkey(*), away_participant:public_participants!fixtures_away_participant_id_fkey(*)")
      .eq("tournament_id", tournament.id)
      .order("scheduled_at"),
    supabase.from("standings").select("*, participant:public_participants(*)").eq("tournament_id", tournament.id).order("position"),
  ]);
  return { tournament, participants: participants ?? [], fixtures: fixtures ?? [], standings: standings ?? [] };
}

export async function getFixtures(params: ListParams & { matchday?: string; round?: string } = {}) {
  if (!hasSupabaseEnv()) {
    const rows = mock.fixtures
      .filter((fixture) => fixture.tournament?.is_published)
      .filter((fixture) => !params.status || fixture.status === params.status)
      .filter((fixture) => !params.matchday || String(fixture.matchday) === params.matchday)
      .filter((fixture) => !params.round || fixture.round_name === params.round)
      .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at));
    return paginate(rows, params);
  }
  const supabase = await createClient();
  let query = supabase
    .from("fixtures")
    .select("*, tournament:tournaments!inner(name,slug,is_published), home_participant:public_participants!fixtures_home_participant_id_fkey(*), away_participant:public_participants!fixtures_away_participant_id_fkey(*)", {
      count: "exact",
    })
    .eq("tournament.is_published", true)
    .order("scheduled_at");
  if (params.status) query = query.eq("status", params.status);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const { data, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  return { rows: (data ?? []) as Fixture[], total: count ?? 0, page, pageSize };
}

export async function getCollections(params: ListParams = {}) {
  if (!hasSupabaseEnv()) return paginate(mock.collections.filter((collection) => collection.is_published), params);
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const { data, count } = await supabase
    .from("collections")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  return { rows: (data ?? []) as Collection[], total: count ?? 0, page, pageSize };
}

export async function getCollectionDetail(slug: string) {
  if (!hasSupabaseEnv()) {
    const collection = mock.collections.find((row) => row.slug === slug && row.is_published);
    if (!collection) return null;
    const participants = mock.collectionParticipants
      .filter((row) => row.collection_id === collection.id)
      .map((row) => ({ ...row, participant: row.participant as PublicParticipant }));
    return { collection, participants };
  }
  const supabase = await createClient();
  const { data: collection } = await supabase.from("collections").select("*").eq("slug", slug).eq("is_published", true).single();
  if (!collection) return null;
  const { data: participants } = await supabase
    .from("collection_participants")
    .select("*, participant:public_participants(*)")
    .eq("collection_id", collection.id)
    .order("joined_at", { ascending: false });
  return { collection: collection as Collection, participants: participants ?? [] };
}
