alter table public.collections
  drop column if exists cover_image_url,
  add column if not exists category text not null default 'Other',
  add column if not exists currency text not null default 'MYR',
  add column if not exists target_amount numeric(12,2) not null default 0,
  add column if not exists start_date timestamptz,
  add column if not exists due_date timestamptz,
  add column if not exists tournament_id uuid references public.tournaments(id);

alter table public.collections drop constraint if exists collections_status_check;
update public.collections
set status = case
  when status = 'Active' then 'Open'
  when status = 'Inactive' then 'Closed'
  else status
end
where status in ('Active','Inactive');
alter table public.collections add constraint collections_status_check
  check (status in ('Draft','Open','Partially Collected','Fully Collected','Overdue','Closed','Cancelled','Archived'));
alter table public.collections add constraint collections_category_check
  check (category in ('Tournament fee','Registration fee','Venue fee','Jersey payment','Event contribution','Prize pool','Other'));
alter table public.collections add constraint collections_currency_check check (currency = 'MYR');
alter table public.collections add constraint collections_target_amount_check check (target_amount >= 0);
alter table public.collections add constraint collections_due_after_start_check
  check (start_date is null or due_date is null or due_date >= start_date);

alter table public.collection_participants
  drop column if exists registration_status,
  drop column if exists notes,
  add column if not exists required_amount numeric(12,2) not null default 0,
  add column if not exists due_date timestamptz,
  add column if not exists payment_status text not null default 'Unpaid',
  add column if not exists is_waived boolean not null default false,
  add column if not exists admin_notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.collection_participants add constraint collection_participants_required_amount_check check (required_amount >= 0);
alter table public.collection_participants add constraint collection_participants_payment_status_check
  check (payment_status in ('Unpaid','Partially Paid','Paid','Overpaid','Waived','Refunded','Cancelled'));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete restrict,
  collection_participant_id uuid not null references public.collection_participants(id) on delete restrict,
  participant_id uuid not null references public.participants(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  payment_date timestamptz not null,
  payment_method text not null check (payment_method in ('Cash','Bank Transfer','DuitNow','Touch ''n Go eWallet','Online Banking','Other')),
  payment_reference text,
  receipt_url text,
  verification_status text not null default 'Pending' check (verification_status in ('Pending','Verified','Rejected','Refunded')),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  internal_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    verification_status <> 'Verified'
    or (verified_by is not null and verified_at is not null)
  )
);

create table if not exists public.payment_refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  reason text not null,
  refunded_at timestamptz not null default now(),
  refunded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.payment_participant_matches_collection()
returns trigger language plpgsql as $$
declare
  linked_collection uuid;
  linked_participant uuid;
begin
  select collection_id, participant_id into linked_collection, linked_participant
  from public.collection_participants
  where id = new.collection_participant_id;

  if linked_collection is null or linked_collection <> new.collection_id or linked_participant <> new.participant_id then
    raise exception 'participant must belong to the selected collection';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_participant_membership on public.payments;
create trigger payments_participant_membership before insert or update on public.payments
for each row execute function public.payment_participant_matches_collection();

create or replace function public.prevent_refund_over_payment()
returns trigger language plpgsql as $$
declare
  payment_amount numeric(12,2);
  refunded_total numeric(12,2);
begin
  select amount into payment_amount from public.payments where id = new.payment_id;
  select coalesce(sum(amount), 0) into refunded_total
  from public.payment_refunds
  where payment_id = new.payment_id and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if refunded_total + new.amount > payment_amount then
    raise exception 'total refunded amount cannot exceed original payment amount';
  end if;

  return new;
end;
$$;

drop trigger if exists payment_refunds_amount_limit on public.payment_refunds;
create trigger payment_refunds_amount_limit before insert or update on public.payment_refunds
for each row execute function public.prevent_refund_over_payment();

create trigger collection_participants_updated_at before update on public.collection_participants
for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

create index if not exists idx_payments_collection_status on public.payments (collection_id, verification_status, payment_date);
create index if not exists idx_collection_participants_status on public.collection_participants (collection_id, payment_status, due_date);

drop view if exists public.public_collection_summaries;
create view public.public_collection_summaries as
with payment_totals as (
  select
    collection_id,
    coalesce(sum(amount) filter (where verification_status = 'Verified'), 0) as total_collected
  from public.payments
  group by collection_id
),
participant_totals as (
  select
    collection_id,
    count(*)::integer as participant_count,
    count(*) filter (where payment_status in ('Paid','Overpaid','Waived'))::integer as paid_participant_count,
    count(*) filter (where payment_status = 'Unpaid')::integer as unpaid_participant_count,
    count(*) filter (where payment_status = 'Partially Paid')::integer as partially_paid_participant_count
  from public.collection_participants
  group by collection_id
)
select
  c.id,
  c.title,
  c.slug,
  c.description,
  c.category,
  c.currency,
  (c.target_amount * 100)::bigint as target_amount,
  (coalesce(pt.total_collected, 0) * 100)::bigint as total_collected,
  (greatest(c.target_amount - coalesce(pt.total_collected, 0), 0) * 100)::bigint as remaining_amount,
  (greatest(coalesce(pt.total_collected, 0) - c.target_amount, 0) * 100)::bigint as excess_amount,
  case
    when c.target_amount > 0 then least((coalesce(pt.total_collected, 0) / c.target_amount) * 100, 100)
    else 0
  end as progress_percentage,
  c.start_date,
  c.due_date,
  c.tournament_id,
  jsonb_build_object('name', t.name, 'slug', t.slug) as tournament,
  c.status,
  c.is_published,
  c.created_at,
  c.updated_at,
  coalesce(cpt.participant_count, 0) as participant_count,
  coalesce(cpt.paid_participant_count, 0) as paid_participant_count,
  coalesce(cpt.unpaid_participant_count, 0) as unpaid_participant_count,
  coalesce(cpt.partially_paid_participant_count, 0) as partially_paid_participant_count
from public.collections c
left join public.tournaments t on t.id = c.tournament_id
left join payment_totals pt on pt.collection_id = c.id
left join participant_totals cpt on cpt.collection_id = c.id
where c.is_published = true and c.archived_at is null;

alter table public.payments enable row level security;
alter table public.payment_refunds enable row level security;

create policy "admins full payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "admins full payment refunds" on public.payment_refunds for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-receipts','payment-receipts', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

create policy "admins read payment receipts" on storage.objects for select using (bucket_id = 'payment-receipts' and public.is_admin());
create policy "admins upload payment receipts" on storage.objects for insert with check (bucket_id = 'payment-receipts' and public.is_admin());
create policy "admins update payment receipts" on storage.objects for update using (bucket_id = 'payment-receipts' and public.is_admin());
create policy "admins delete payment receipts" on storage.objects for delete using (bucket_id = 'payment-receipts' and public.is_admin());
