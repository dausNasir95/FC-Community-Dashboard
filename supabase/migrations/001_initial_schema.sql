create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'admin' check (role in ('super_admin','admin','moderator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text not null,
  event_date timestamptz not null,
  category text not null,
  status text not null check (status in ('Upcoming','Ongoing','Completed','Cancelled')),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  cover_image_url text,
  format text not null,
  rules text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  registration_url text,
  maximum_participants integer check (maximum_participants is null or maximum_participants > 0),
  status text not null check (status in ('Draft','Upcoming','Ongoing','Completed','Cancelled','Archived')),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  ea_id citext unique,
  psn_id citext unique,
  platform text,
  team_name text,
  phone_number text,
  social_username text,
  notes text,
  status text not null default 'Active' check (status in ('Active','Inactive','Suspended','Archived')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.tournament_participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete restrict,
  group_name text,
  seed_number integer check (seed_number is null or seed_number > 0),
  created_at timestamptz not null default now(),
  unique (tournament_id, participant_id)
);

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  matchday integer check (matchday is null or matchday > 0),
  round_name text,
  home_participant_id uuid not null references public.participants(id) on delete restrict,
  away_participant_id uuid not null references public.participants(id) on delete restrict,
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  scheduled_at timestamptz not null,
  status text not null check (status in ('Scheduled','Live','Completed','Postponed','Cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_participant_id <> away_participant_id),
  unique (tournament_id, home_participant_id, away_participant_id, scheduled_at)
);

create table public.standings (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete restrict,
  played integer not null default 0 check (played >= 0),
  won integer not null default 0 check (won >= 0),
  drawn integer not null default 0 check (drawn >= 0),
  lost integer not null default 0 check (lost >= 0),
  goals_for integer not null default 0 check (goals_for >= 0),
  goals_against integer not null default 0 check (goals_against >= 0),
  goal_difference integer not null default 0,
  calculated_points integer not null default 0,
  manual_adjustment integer not null default 0,
  points integer not null default 0,
  position integer check (position is null or position > 0),
  updated_at timestamptz not null default now(),
  unique (tournament_id, participant_id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  cover_image_url text,
  status text not null check (status in ('Active','Inactive','Archived')),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.collection_participants (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete restrict,
  registration_status text,
  notes text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (collection_id, participant_id)
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

create view public.public_participants as
select id, display_name, ea_id::text, psn_id::text, platform, team_name, social_username, status
from public.participants
where status <> 'Archived';

create index idx_posters_published_status on public.posters (is_published, status, event_date);
create index idx_tournaments_published_status on public.tournaments (is_published, status, start_date);
create index idx_fixtures_tournament_schedule on public.fixtures (tournament_id, scheduled_at);
create index idx_standings_sort on public.standings (tournament_id, points desc, goal_difference desc, goals_for desc);
create index idx_collection_participants_collection on public.collection_participants (collection_id);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger posters_updated_at before update on public.posters for each row execute function public.set_updated_at();
create trigger tournaments_updated_at before update on public.tournaments for each row execute function public.set_updated_at();
create trigger participants_updated_at before update on public.participants for each row execute function public.set_updated_at();
create trigger fixtures_updated_at before update on public.fixtures for each row execute function public.set_updated_at();
create trigger standings_updated_at before update on public.standings for each row execute function public.set_updated_at();
create trigger collections_updated_at before update on public.collections for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super_admin','admin','moderator')
  );
$$;

alter table public.profiles enable row level security;
alter table public.posters enable row level security;
alter table public.tournaments enable row level security;
alter table public.participants enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.fixtures enable row level security;
alter table public.standings enable row level security;
alter table public.collections enable row level security;
alter table public.collection_participants enable row level security;
alter table public.activity_logs enable row level security;

create policy "admins full profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins full posters" on public.posters for all using (public.is_admin()) with check (public.is_admin());
create policy "public read published posters" on public.posters for select using (is_published = true and archived_at is null);
create policy "admins full tournaments" on public.tournaments for all using (public.is_admin()) with check (public.is_admin());
create policy "public read published tournaments" on public.tournaments for select using (is_published = true and archived_at is null);
create policy "admins full participants" on public.participants for all using (public.is_admin()) with check (public.is_admin());
create policy "admins full tournament participants" on public.tournament_participants for all using (public.is_admin()) with check (public.is_admin());
create policy "public read tournament participants for published tournaments" on public.tournament_participants for select using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_published and t.archived_at is null));
create policy "admins full fixtures" on public.fixtures for all using (public.is_admin()) with check (public.is_admin());
create policy "public read fixtures for published tournaments" on public.fixtures for select using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_published and t.archived_at is null));
create policy "admins full standings" on public.standings for all using (public.is_admin()) with check (public.is_admin());
create policy "public read standings for published tournaments" on public.standings for select using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.is_published and t.archived_at is null));
create policy "admins full collections" on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy "public read published collections" on public.collections for select using (is_published = true and archived_at is null);
create policy "admins full collection participants" on public.collection_participants for all using (public.is_admin()) with check (public.is_admin());
create policy "public read collection participants for published collections" on public.collection_participants for select using (exists (select 1 from public.collections c where c.id = collection_id and c.is_published and c.archived_at is null));
create policy "admins read activity logs" on public.activity_logs for select using (public.is_admin());
create policy "admins write activity logs" on public.activity_logs for insert with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('posters','posters', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('tournaments','tournaments', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('collections','collections', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public read community images" on storage.objects for select using (bucket_id in ('posters','tournaments','collections'));
create policy "admins upload community images" on storage.objects for insert with check (bucket_id in ('posters','tournaments','collections') and public.is_admin());
create policy "admins update community images" on storage.objects for update using (bucket_id in ('posters','tournaments','collections') and public.is_admin());
create policy "admins delete community images" on storage.objects for delete using (bucket_id in ('posters','tournaments','collections') and public.is_admin());
