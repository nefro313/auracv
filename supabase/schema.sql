-- ============================================================
-- AuraCV — Supabase schema
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- ---------- users table ----------
-- Column names are camelCase (quoted) because supabase-js queries
-- them as-is throughout the app.
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  -- Defaults to the signed-in user so inserts that omit it
  -- (the "Create Manually" flow) still get the right owner.
  "userId"    uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  "userName"  text not null,
  "userEmail" text,
  "resumeJson" jsonb,
  "metaJson"   jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),

  constraint users_username_unique unique ("userName"),
  constraint users_userid_unique   unique ("userId"),
  -- subdomain-safe usernames: lowercase letters, digits, hyphens
  constraint users_username_format check ("userName" ~ '^[a-z0-9-]+$')
);

create index if not exists users_username_idx on public.users ("userName");

-- ---------- row level security ----------
alter table public.users enable row level security;

-- Portfolios are public websites: anyone may read.
drop policy if exists "Public read" on public.users;
create policy "Public read"
  on public.users for select
  using (true);

-- Signed-in users may create exactly their own row.
drop policy if exists "Users insert own row" on public.users;
create policy "Users insert own row"
  on public.users for insert to authenticated
  with check (auth.uid() = "userId");

-- Owners may update / delete their row.
drop policy if exists "Users update own row" on public.users;
create policy "Users update own row"
  on public.users for update to authenticated
  using (auth.uid() = "userId")
  with check (auth.uid() = "userId");

drop policy if exists "Users delete own row" on public.users;
create policy "Users delete own row"
  on public.users for delete to authenticated
  using (auth.uid() = "userId");

-- ---------- storage buckets ----------
-- "resume": uploaded CV PDFs (create page)
-- "auracv": profile images & assets (home editor)
-- Both are public because the app builds public object URLs.
insert into storage.buckets (id, name, public)
values ('resume', 'resume', true), ('auracv', 'auracv', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated uploads" on storage.objects;
create policy "Authenticated uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('resume', 'auracv'));

drop policy if exists "Authenticated overwrite own uploads" on storage.objects;
create policy "Authenticated overwrite own uploads"
  on storage.objects for update to authenticated
  using (bucket_id in ('resume', 'auracv'));

-- ---------- done ----------
-- Refresh PostgREST's schema cache so the API sees the new table
-- immediately (otherwise it can take a minute).
notify pgrst, 'reload schema';
