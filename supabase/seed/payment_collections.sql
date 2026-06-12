update public.collections set
  title = 'Super League Season 3 Registration Fee',
  slug = 'super-league-season-3-registration-fee',
  description = 'Registration payment campaign for Clorox Super League Season 3 participants.',
  category = 'Registration fee',
  currency = 'MYR',
  target_amount = 3200.00,
  start_date = '2026-06-15T00:00:00Z',
  due_date = '2026-07-10T23:59:00Z',
  tournament_id = '11111111-1111-1111-1111-111111111111',
  status = 'Open',
  is_published = true
where id = '33333333-3333-3333-3333-333333333333';

update public.collections set
  title = 'Prize Pool Collection',
  slug = 'prize-pool-collection',
  description = 'Community prize pool contribution for finalists and weekly awards.',
  category = 'Prize pool',
  currency = 'MYR',
  target_amount = 5000.00,
  start_date = '2026-06-01T00:00:00Z',
  due_date = '2026-06-30T23:59:00Z',
  tournament_id = '22222222-2222-2222-2222-222222222222',
  status = 'Partially Collected',
  is_published = true
where id = '44444444-4444-4444-4444-444444444444';

update public.collection_participants
set required_amount = 40.00, payment_status = 'Unpaid', due_date = '2026-07-10T23:59:00Z', admin_notes = 'Private payment note.'
where collection_id = '33333333-3333-3333-3333-333333333333';

insert into public.payments (
  collection_id,
  collection_participant_id,
  participant_id,
  amount,
  payment_date,
  payment_method,
  payment_reference,
  verification_status,
  internal_notes
)
select
  cp.collection_id,
  cp.id,
  cp.participant_id,
  40.00,
  '2026-06-20T12:00:00Z',
  'Bank Transfer',
  'PRIVATE-SEED-REF',
  'Pending',
  'Seed payment; set verified_by after creating an admin profile.'
from public.collection_participants cp
where cp.collection_id = '33333333-3333-3333-3333-333333333333'
limit 1;
