-- Cadence research-sync schema.
--
-- Run this once in your Supabase project's SQL editor (Dashboard ->
-- SQL Editor -> New query -> paste this whole file -> Run). See
-- supabase/README.md for the full setup checklist, including enabling
-- Anonymous Sign-Ins, which this schema depends on.
--
-- Every tester gets a real (but anonymous) Supabase auth user, created
-- silently on first launch via supabase.auth.signInAnonymously(). Row
-- Level Security below uses that user's id (auth.uid()) to guarantee one
-- tester's device can only ever read or write its own rows — a client
-- holding the public anon key cannot read or edit anyone else's data,
-- unlike a scheme keyed on a plain client-supplied device id.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  typical_cycle_length int not null,
  typical_period_length int not null,
  period_starts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  energy int,
  symptoms jsonb not null default '[]'::jsonb,
  flow text,
  session_logged boolean,
  logged_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  helpfulness int not null check (helpfulness between 1 and 5),
  comments text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.feedback enable row level security;

create policy "profiles: owner select" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles: owner insert" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = user_id);
create policy "profiles: owner delete" on public.profiles
  for delete using (auth.uid() = user_id);

create policy "daily_logs: owner select" on public.daily_logs
  for select using (auth.uid() = user_id);
create policy "daily_logs: owner insert" on public.daily_logs
  for insert with check (auth.uid() = user_id);
create policy "daily_logs: owner update" on public.daily_logs
  for update using (auth.uid() = user_id);
create policy "daily_logs: owner delete" on public.daily_logs
  for delete using (auth.uid() = user_id);

-- Feedback is insert + read-your-own only from the app. You review all of
-- it from the Supabase dashboard / SQL editor, which runs as the project
-- owner and bypasses RLS — testers can never see each other's comments.
create policy "feedback: owner insert" on public.feedback
  for insert with check (auth.uid() = user_id);
create policy "feedback: owner select" on public.feedback
  for select using (auth.uid() = user_id);
