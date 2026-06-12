# FC26 Community Dashboard

Production-ready Next.js App Router application for FC26 community posters, tournaments, fixtures, standings, participant records, and payment collections.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 and shadcn-style local UI primitives
- Supabase PostgreSQL, Authentication, Storage, and Row Level Security
- Zod, React Hook Form-ready schemas, server actions
- Vitest for business-logic tests
- Vercel deployment and GitHub source control

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase environment variables, the app renders development seed data and allows the admin dashboard in dev mode. Set Supabase variables to use real authentication and database reads/writes.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor or with the Supabase CLI.
3. Run `supabase/seed/seed.sql` for development data.
4. Create your first user in Supabase Auth.
5. Insert a matching profile:

```sql
insert into public.profiles (id, email, display_name, role)
values ('AUTH_USER_ID', 'admin@example.com', 'Community Admin', 'super_admin');
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` is for secure server-side code only. Never expose it to client components.

## Database and Security

The migrations create normalized tables for profiles, posters, tournaments, participants, tournament assignments, fixtures, standings, payment collections, collection participant payment obligations, payments, refunds, and activity logs. UUID primary keys, foreign keys, check constraints, unique constraints, indexes, and `updated_at` triggers are included.

RLS is enabled on all application tables. Public users can only read published posters, tournaments, fixtures/standings tied to published tournaments, published payment collection summaries, and participant data through safe public views. Private participant fields, payment references, receipt URLs, internal notes, verification details, and admin identity are never exposed through public queries.

Storage buckets are created for `posters`, `tournaments`, and `collections` with JPEG, PNG, and WebP limits up to 5 MB. A private `payment-receipts` bucket accepts JPEG, PNG, WebP, and PDF files up to 5 MB. Upload/update/delete policies require an authenticated admin profile.

## Admin

Routes:

- `/admin/login`
- `/admin`
- `/admin/posters`
- `/admin/tournaments`
- `/admin/fixtures`
- `/admin/standings`
- `/admin/participants`
- `/admin/collections`
- `/admin/settings`

Middleware protects every `/admin` route except login when Supabase env vars are configured. The role model supports `super_admin`, `admin`, and `moderator`.

## Development Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Deployment

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add the environment variables in Vercel project settings.
4. Run the Supabase migration before first deployment.
5. Configure Supabase Auth redirect URLs to include your Vercel domain.

## Troubleshooting

- If admin login loops, confirm the user has a `profiles` row with an admin role.
- If images fail to upload, confirm the storage buckets and policies from the migration exist.
- If public pages are empty, verify records are published and not archived.
- If mutations fail, check RLS policies and that the active user passes `public.is_admin()`.
