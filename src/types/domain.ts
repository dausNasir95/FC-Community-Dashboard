export type AdminRole = "super_admin" | "admin" | "moderator";

export type PosterStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type TournamentStatus = "Draft" | "Upcoming" | "Ongoing" | "Completed" | "Cancelled" | "Archived";
export type FixtureStatus = "Scheduled" | "Live" | "Completed" | "Postponed" | "Cancelled";
export type CollectionStatus =
  | "Draft"
  | "Open"
  | "Partially Collected"
  | "Fully Collected"
  | "Overdue"
  | "Closed"
  | "Cancelled"
  | "Archived";
export type CollectionCategory =
  | "Tournament fee"
  | "Registration fee"
  | "Venue fee"
  | "Jersey payment"
  | "Event contribution"
  | "Prize pool"
  | "Other";
export type PaymentStatus = "Unpaid" | "Partially Paid" | "Paid" | "Overpaid" | "Waived" | "Refunded" | "Cancelled";
export type PaymentMethod = "Cash" | "Bank Transfer" | "DuitNow" | "Touch 'n Go eWallet" | "Online Banking" | "Other";
export type VerificationStatus = "Pending" | "Verified" | "Rejected" | "Refunded";
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
  category: CollectionCategory;
  currency: "MYR";
  target_amount: number;
  total_collected?: number;
  remaining_amount?: number;
  excess_amount?: number;
  progress_percentage?: number;
  start_date: string | null;
  due_date: string | null;
  tournament_id: string | null;
  tournament?: Pick<Tournament, "name" | "slug"> | null;
  status: CollectionStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  paid_participant_count?: number;
  unpaid_participant_count?: number;
  partially_paid_participant_count?: number;
};

export type CollectionParticipant = {
  id: string;
  collection_id: string;
  participant_id: string;
  required_amount: number;
  total_paid?: number;
  outstanding_amount?: number;
  payment_status: PaymentStatus;
  due_date: string | null;
  is_waived: boolean;
  admin_notes?: string | null;
  joined_at: string;
  updated_at: string;
  participant?: PublicParticipant;
};

export type Payment = {
  id: string;
  collection_id: string;
  collection_participant_id: string;
  participant_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  receipt_url: string | null;
  verification_status: VerificationStatus;
  verified_by: string | null;
  verified_at: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentRefund = {
  id: string;
  payment_id: string;
  amount: number;
  reason: string;
  refunded_at: string;
  refunded_by: string | null;
  created_at: string;
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
