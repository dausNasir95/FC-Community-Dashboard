export type AdminRole = "super_admin" | "admin" | "moderator";

export type PosterStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type TournamentStatus = "Draft" | "Upcoming" | "Ongoing" | "Completed" | "Cancelled" | "Archived";
export type FixtureStatus = "Scheduled" | "Live" | "Completed" | "Postponed" | "Cancelled";
export type CollectionStatus = "Active" | "Inactive" | "Archived";
export type ParticipantStatus = "Active" | "Inactive" | "Suspended" | "Archived";

export type Poster = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  event_date: string;
  category: string;
  status: PosterStatus;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Tournament = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  format: string;
  rules: string;
  start_date: string;
  end_date: string;
  registration_url: string | null;
  maximum_participants: number | null;
  status: TournamentStatus;
  is_published: boolean;
};

export type PublicParticipant = {
  id: string;
  display_name: string;
  ea_id: string | null;
  psn_id: string | null;
  platform: string | null;
  team_name: string | null;
  social_username: string | null;
  status: ParticipantStatus;
};

export type Participant = PublicParticipant & {
  phone_number?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type TournamentParticipant = {
  id: string;
  tournament_id: string;
  participant_id: string;
  group_name: string | null;
  seed_number: number | null;
  participant?: PublicParticipant;
};

export type Fixture = {
  id: string;
  tournament_id: string;
  matchday: number | null;
  round_name: string | null;
  home_participant_id: string;
  away_participant_id: string;
  home_score: number | null;
  away_score: number | null;
  scheduled_at: string;
  status: FixtureStatus;
  home_participant?: PublicParticipant;
  away_participant?: PublicParticipant;
  tournament?: Pick<Tournament, "name" | "slug" | "is_published">;
};

export type Standing = {
  id: string;
  tournament_id: string;
  participant_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  calculated_points: number;
  manual_adjustment: number;
  points: number;
  position: number | null;
  participant?: PublicParticipant;
};

export type Collection = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  status: CollectionStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  participant_count?: number;
};

export type CollectionParticipant = {
  id: string;
  collection_id: string;
  participant_id: string;
  registration_status: string | null;
  joined_at: string;
  participant?: PublicParticipant;
};

export type ActivityLog = {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  created_at: string;
};

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export type Paginated<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};
