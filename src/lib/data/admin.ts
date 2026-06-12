import * as mock from "@/lib/mock-data";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Collection, CollectionParticipant, Fixture, ListParams, Paginated, Participant, Poster, Tournament, TournamentParticipant } from "@/types/domain";

function paginate<T>(rows: T[], params: ListParams = {}): Paginated<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const search = params.search?.toLowerCase();
  const filtered = search
    ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search))
    : rows;
  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize };
}

export async function getAdminOverview() {
  if (!hasSupabaseEnv()) {
    return {
      totalPosters: mock.posters.length,
      totalTournaments: mock.tournaments.length,
      activeTournaments: mock.tournaments.filter((row) => row.status === "Ongoing").length,
      upcomingFixtures: mock.fixtures.filter((row) => row.status === "Scheduled").length,
      totalParticipants: mock.participants.length,
      totalCollections: mock.collections.length,
      activity: mock.activityLogs,
      recent: [...mock.posters, ...mock.collections].slice(0, 5),
    };
  }
  const supabase = await createClient();
  const [posters, tournaments, active, fixtures, participants, collections, activity] = await Promise.all([
    supabase.from("posters").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }).eq("status", "Ongoing"),
    supabase.from("fixtures").select("id", { count: "exact", head: true }).eq("status", "Scheduled"),
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase.from("collections").select("id", { count: "exact", head: true }),
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(6),
  ]);
  return {
    totalPosters: posters.count ?? 0,
    totalTournaments: tournaments.count ?? 0,
    activeTournaments: active.count ?? 0,
    upcomingFixtures: fixtures.count ?? 0,
    totalParticipants: participants.count ?? 0,
    totalCollections: collections.count ?? 0,
    activity: activity.data ?? [],
    recent: [],
  };
}

const tableMocks = {
  posters: mock.posters,
  tournaments: mock.tournaments,
  participants: mock.participants,
  fixtures: mock.fixtures,
  standings: mock.standings,
  collections: mock.collections,
} as const;

export async function listAdminTable(table: keyof typeof tableMocks, params: ListParams = {}) {
  if (!hasSupabaseEnv()) return paginate([...tableMocks[table]], params);
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  let query = supabase.from(table).select("*", { count: "exact" }).range((page - 1) * pageSize, page * pageSize - 1);
  if (params.status) query = query.eq("status", params.status);
  const { data, count } = await query;
  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getAdminRecord(table: keyof typeof tableMocks, id: string) {
  if (!hasSupabaseEnv()) return tableMocks[table].find((row) => row.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from(table).select("*").eq("id", id).single();
  return data;
}

export async function getAdminTournaments() {
  if (!hasSupabaseEnv()) return mock.tournaments;
  const supabase = await createClient();
  const { data } = await supabase.from("tournaments").select("id,name,slug,status").order("name");
  return (data ?? []) as Tournament[];
}

export async function getAdminTournamentDetail(id: string) {
  if (!hasSupabaseEnv()) {
    const tournament = mock.tournaments.find((row) => row.id === id) ?? null;
    return {
      tournament,
      tournamentParticipants: mock.tournamentParticipants.filter((row) => row.tournament_id === id),
      participants: mock.participants,
      fixtures: mock.fixtures.filter((row) => row.tournament_id === id),
    };
  }

  const supabase = await createClient();
  const [{ data: tournament }, { data: tournamentParticipants }, { data: participants }, { data: fixtures }] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", id).single(),
    supabase
      .from("tournament_participants")
      .select("*, participant:participants(id, display_name, ea_id, psn_id, platform, team_name, social_username, status)")
      .eq("tournament_id", id)
      .order("seed_number", { ascending: true, nullsFirst: false }),
    supabase
      .from("participants")
      .select("id, display_name, ea_id, psn_id, platform, team_name, social_username, status")
      .neq("status", "Archived")
      .order("display_name"),
    supabase
      .from("fixtures")
      .select("*, home_participant:participants!fixtures_home_participant_id_fkey(id, display_name), away_participant:participants!fixtures_away_participant_id_fkey(id, display_name)")
      .eq("tournament_id", id)
      .order("scheduled_at"),
  ]);

  return {
    tournament: tournament as Tournament | null,
    tournamentParticipants: (tournamentParticipants ?? []) as unknown as TournamentParticipant[],
    participants: (participants ?? []) as Participant[],
    fixtures: (fixtures ?? []) as unknown as Fixture[],
  };
}

export async function getAdminFixtureRows(params: ListParams = {}) {
  if (!hasSupabaseEnv()) {
    return paginate(
      mock.fixtures.map((fixture) => ({
        ...fixture,
        tournament_name: fixture.tournament?.name ?? fixture.tournament_id,
        home_name: fixture.home_participant?.display_name ?? fixture.home_participant_id,
        away_name: fixture.away_participant?.display_name ?? fixture.away_participant_id,
      })),
      params,
    );
  }

  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  let query = supabase
    .from("fixtures")
    .select("*, tournament:tournaments(name), home_participant:participants!fixtures_home_participant_id_fkey(display_name), away_participant:participants!fixtures_away_participant_id_fkey(display_name)", {
      count: "exact",
    })
    .order("scheduled_at")
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (params.status) query = query.eq("status", params.status);
  const { data, count } = await query;
  const rows = (data ?? []).map((fixture) => ({
    ...fixture,
    tournament_name: fixture.tournament?.name ?? fixture.tournament_id,
    home_name: fixture.home_participant?.display_name ?? fixture.home_participant_id,
    away_name: fixture.away_participant?.display_name ?? fixture.away_participant_id,
  }));
  return { rows, total: count ?? 0, page, pageSize };
}

export async function getAdminCollectionDetail(id: string) {
  if (!hasSupabaseEnv()) {
    const collection = mock.collections.find((row) => row.id === id) ?? null;
    return {
      collection,
      collectionParticipants: mock.collectionParticipants.filter((row) => row.collection_id === id),
      participants: mock.participants,
    };
  }

  const supabase = await createClient();
  const [{ data: collection }, { data: collectionParticipants }, { data: participants }] = await Promise.all([
    supabase.from("collections").select("*").eq("id", id).single(),
    supabase
      .from("collection_participants")
      .select("*, participant:participants(id, display_name, ea_id, psn_id, platform, team_name, social_username, status)")
      .eq("collection_id", id)
      .order("joined_at", { ascending: false }),
    supabase
      .from("participants")
      .select("id, display_name, ea_id, psn_id, platform, team_name, social_username, status")
      .neq("status", "Archived")
      .order("display_name"),
  ]);

  return {
    collection: collection as Collection | null,
    collectionParticipants: (collectionParticipants ?? []) as unknown as CollectionParticipant[],
    participants: (participants ?? []) as Participant[],
  };
}

export type EditablePoster = Poster;
export type EditableCollection = Collection;
