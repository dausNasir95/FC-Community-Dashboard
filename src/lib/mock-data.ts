import type {
  ActivityLog,
  Collection,
  CollectionParticipant,
  Fixture,
  Participant,
  Poster,
  Standing,
  Tournament,
  TournamentParticipant,
} from "@/types/domain";

const now = "2026-06-12T12:00:00.000Z";

export const participants: Participant[] = [
  ["p1", "Neon Striker", "NEON10", "neonstriker", "PS5", "Green Blitz"],
  ["p2", "Pixel Maestro", "PIXEL8", "pixelmaestro", "Xbox", "Byte FC"],
  ["p3", "Captain Clutch", "CLUTCH7", "captclutch", "PC", "Late Winners"],
  ["p4", "Turbo Ace", "TURBO11", "turboace", "PS5", "Rapid XI"],
  ["p5", "Metro Finisher", "METRO9", "metrofinisher", "Xbox", "City Sparks"],
  ["p6", "Vortex Wing", "VORTEX3", "vortexwing", "PC", "Crossbar Club"],
  ["p7", "Golden Pivot", "PIVOT6", "goldenpivot", "PS5", "Midfield Union"],
  ["p8", "Silent Keeper", "KEEP1", "silentkeeper", "Xbox", "Clean Sheet Co"],
].map(([id, display_name, ea_id, psn_id, platform, team_name]) => ({
  id,
  display_name,
  ea_id,
  psn_id,
  platform,
  team_name,
  phone_number: "+1 555 0100",
  social_username: `@${psn_id}`,
  notes: "Internal admin note hidden from public views.",
  status: "Active",
  created_at: now,
  updated_at: now,
}));

export const posters: Poster[] = [
  {
    id: "poster-1",
    title: "Friday Night Kickoff",
    slug: "friday-night-kickoff",
    description: "Weekly FC26 community kickoff with open lobbies and featured matches.",
    image_url:
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80",
    event_date: "2026-07-03T23:00:00.000Z",
    category: "Community",
    status: "Upcoming",
    is_featured: true,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "poster-2",
    title: "Clorox Super League Draw",
    slug: "clorox-super-league-draw",
    description: "Group draw and fixtures reveal for the next league cycle.",
    image_url:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80",
    event_date: "2026-07-10T20:00:00.000Z",
    category: "Tournament",
    status: "Upcoming",
    is_featured: false,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "poster-3",
    title: "Meet and Greet FC26",
    slug: "meet-and-greet-fc26",
    description: "Community stream and player introductions before the season begins.",
    image_url:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    event_date: "2026-07-17T21:00:00.000Z",
    category: "Social",
    status: "Upcoming",
    is_featured: false,
    is_published: true,
    created_at: now,
    updated_at: now,
  },
];

export const tournaments: Tournament[] = [
  {
    id: "t1",
    name: "Clorox Super League Season 3",
    slug: "clorox-super-league-season-3",
    description: "A competitive FC26 league for community regulars with weekly fixtures.",
    cover_image_url:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    format: "League",
    rules: "Standard FC26 online friendlies. Three points for a win, one for a draw.",
    start_date: "2026-07-20T20:00:00.000Z",
    end_date: "2026-09-12T20:00:00.000Z",
    registration_url: "https://example.com/register",
    maximum_participants: 32,
    status: "Upcoming",
    is_published: true,
  },
  {
    id: "t2",
    name: "Division Cup Invitational",
    slug: "division-cup-invitational",
    description: "A knockout cup built around promotion rivals and returning finalists.",
    cover_image_url:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    format: "Knockout",
    rules: "Single elimination. Extra time and penalties decide tied fixtures.",
    start_date: "2026-06-01T20:00:00.000Z",
    end_date: "2026-06-30T20:00:00.000Z",
    registration_url: null,
    maximum_participants: 16,
    status: "Ongoing",
    is_published: true,
  },
];

export const tournamentParticipants: TournamentParticipant[] = participants.slice(0, 6).map((participant, index) => ({
  id: `tp-${participant.id}`,
  tournament_id: index < 4 ? "t1" : "t2",
  participant_id: participant.id,
  group_name: index % 2 === 0 ? "Group A" : "Group B",
  seed_number: index + 1,
  participant,
}));

export const fixtures: Fixture[] = [
  {
    id: "f1",
    tournament_id: "t1",
    matchday: 1,
    round_name: "Opening Week",
    home_participant_id: "p1",
    away_participant_id: "p2",
    home_score: null,
    away_score: null,
    scheduled_at: "2026-07-20T22:00:00.000Z",
    status: "Scheduled",
    home_participant: participants[0],
    away_participant: participants[1],
    tournament: tournaments[0],
  },
  {
    id: "f2",
    tournament_id: "t2",
    matchday: 2,
    round_name: "Semifinal",
    home_participant_id: "p5",
    away_participant_id: "p6",
    home_score: 3,
    away_score: 1,
    scheduled_at: "2026-06-08T22:00:00.000Z",
    status: "Completed",
    home_participant: participants[4],
    away_participant: participants[5],
    tournament: tournaments[1],
  },
  {
    id: "f3",
    tournament_id: "t1",
    matchday: 1,
    round_name: "Opening Week",
    home_participant_id: "p3",
    away_participant_id: "p4",
    home_score: null,
    away_score: null,
    scheduled_at: "2026-07-21T22:00:00.000Z",
    status: "Scheduled",
    home_participant: participants[2],
    away_participant: participants[3],
    tournament: tournaments[0],
  },
];

export const standings: Standing[] = [
  ["p5", 1, 1, 0, 0, 3, 1, 3],
  ["p6", 1, 0, 0, 1, 1, 3, 0],
].map(([participant_id, played, won, drawn, lost, goals_for, goals_against, points], index) => ({
  id: `s-${participant_id}`,
  tournament_id: "t2",
  participant_id: String(participant_id),
  played: Number(played),
  won: Number(won),
  drawn: Number(drawn),
  lost: Number(lost),
  goals_for: Number(goals_for),
  goals_against: Number(goals_against),
  goal_difference: Number(goals_for) - Number(goals_against),
  calculated_points: Number(points),
  manual_adjustment: 0,
  points: Number(points),
  position: index + 1,
  participant: participants.find((participant) => participant.id === participant_id),
}));

export const collections: Collection[] = [
  {
    id: "c1",
    title: "Community Members",
    slug: "community-members",
    description: "Active FC26 community members available for events and tournaments.",
    cover_image_url:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    status: "Active",
    is_published: true,
    created_at: now,
    updated_at: now,
    participant_count: 8,
  },
  {
    id: "c2",
    title: "Division 1 Players",
    slug: "division-1-players",
    description: "Top ranked players and playoff hopefuls.",
    cover_image_url:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
    status: "Active",
    is_published: true,
    created_at: now,
    updated_at: now,
    participant_count: 4,
  },
];

export const collectionParticipants: CollectionParticipant[] = participants.map((participant, index) => ({
  id: `cp-${participant.id}`,
  collection_id: index < 4 ? "c2" : "c1",
  participant_id: participant.id,
  registration_status: index % 2 === 0 ? "Confirmed" : "Pending",
  joined_at: now,
  participant,
}));

export const activityLogs: ActivityLog[] = [
  {
    id: "a1",
    admin_id: null,
    action: "seed",
    entity_type: "system",
    entity_id: null,
    description: "Development seed data loaded.",
    created_at: now,
  },
];
