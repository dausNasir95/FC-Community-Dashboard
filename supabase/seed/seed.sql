insert into public.posters (title, slug, description, image_url, event_date, category, status, is_featured, is_published)
values
('Friday Night Kickoff','friday-night-kickoff','Weekly FC26 community kickoff with open lobbies and featured matches.','https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80','2026-07-03T23:00:00Z','Community','Upcoming',true,true),
('Clorox Super League Draw','clorox-super-league-draw','Group draw and fixtures reveal for the next league cycle.','https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','2026-07-10T20:00:00Z','Tournament','Upcoming',false,true);

insert into public.tournaments (id, name, slug, description, cover_image_url, format, rules, start_date, end_date, registration_url, maximum_participants, status, is_published)
values
('11111111-1111-1111-1111-111111111111','Clorox Super League Season 3','clorox-super-league-season-3','A competitive FC26 league for community regulars with weekly fixtures.','https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80','League','Three points for a win, one for a draw.','2026-07-20T20:00:00Z','2026-09-12T20:00:00Z','https://example.com/register',32,'Upcoming',true),
('22222222-2222-2222-2222-222222222222','Division Cup Invitational','division-cup-invitational','A knockout cup built around promotion rivals and returning finalists.','https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80','Knockout','Extra time and penalties decide tied fixtures.','2026-06-01T20:00:00Z','2026-06-30T20:00:00Z',null,16,'Ongoing',true);

insert into public.participants (id, display_name, ea_id, psn_id, platform, team_name, social_username, status)
values
('aaaaaaaa-0000-0000-0000-000000000001','Neon Striker','NEON10','neonstriker','PS5','Green Blitz','@neonstriker','Active'),
('aaaaaaaa-0000-0000-0000-000000000002','Pixel Maestro','PIXEL8','pixelmaestro','Xbox','Byte FC','@pixelmaestro','Active'),
('aaaaaaaa-0000-0000-0000-000000000003','Captain Clutch','CLUTCH7','captclutch','PC','Late Winners','@captclutch','Active'),
('aaaaaaaa-0000-0000-0000-000000000004','Turbo Ace','TURBO11','turboace','PS5','Rapid XI','@turboace','Active'),
('aaaaaaaa-0000-0000-0000-000000000005','Metro Finisher','METRO9','metrofinisher','Xbox','City Sparks','@metrofinisher','Active'),
('aaaaaaaa-0000-0000-0000-000000000006','Vortex Wing','VORTEX3','vortexwing','PC','Crossbar Club','@vortexwing','Active'),
('aaaaaaaa-0000-0000-0000-000000000007','Golden Pivot','PIVOT6','goldenpivot','PS5','Midfield Union','@goldenpivot','Active'),
('aaaaaaaa-0000-0000-0000-000000000008','Silent Keeper','KEEP1','silentkeeper','Xbox','Clean Sheet Co','@silentkeeper','Active');

insert into public.tournament_participants (tournament_id, participant_id, group_name, seed_number)
select '11111111-1111-1111-1111-111111111111', id, case when right(id::text, 1)::int % 2 = 0 then 'Group B' else 'Group A' end, row_number() over ()
from public.participants limit 4;

insert into public.fixtures (tournament_id, matchday, round_name, home_participant_id, away_participant_id, home_score, away_score, scheduled_at, status)
values
('11111111-1111-1111-1111-111111111111',1,'Opening Week','aaaaaaaa-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000002',null,null,'2026-07-20T22:00:00Z','Scheduled'),
('11111111-1111-1111-1111-111111111111',1,'Opening Week','aaaaaaaa-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000004',null,null,'2026-07-21T22:00:00Z','Scheduled');

insert into public.standings (tournament_id, participant_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, calculated_points, manual_adjustment, points, position)
values
('11111111-1111-1111-1111-111111111111','aaaaaaaa-0000-0000-0000-000000000001',0,0,0,0,0,0,0,0,0,0,1);

insert into public.collections (id, title, slug, description, category, currency, target_amount, start_date, due_date, tournament_id, status, is_published)
values
('33333333-3333-3333-3333-333333333333','Super League Season 3 Registration Fee','super-league-season-3-registration-fee','Registration payment campaign for Clorox Super League Season 3 participants.','Registration fee','MYR',3200.00,'2026-06-15T00:00:00Z','2026-07-10T23:59:00Z','11111111-1111-1111-1111-111111111111','Open',true),
('44444444-4444-4444-4444-444444444444','Prize Pool Collection','prize-pool-collection','Community prize pool contribution for finalists and weekly awards.','Prize pool','MYR',5000.00,'2026-06-01T00:00:00Z','2026-06-30T23:59:00Z','22222222-2222-2222-2222-222222222222','Partially Collected',true);

insert into public.collection_participants (collection_id, participant_id, required_amount, payment_status, due_date)
select '33333333-3333-3333-3333-333333333333', id, 40.00, 'Unpaid', '2026-07-10T23:59:00Z' from public.participants;

insert into public.activity_logs (action, entity_type, description)
values ('seed','system','Development seed data loaded. No real credentials included.');
