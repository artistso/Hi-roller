-- High Roller — Supabase schema with Row Level Security
-- Run in the SQL editor of your project.

create extension if not exists "pgcrypto";

create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  rank integer not null default 0,
  tier text not null default 'Bronze',
  wins integer not null default 0,
  losses integer not null default 0,
  chips integer not null default 900,
  level integer not null default 1,
  xp integer not null default 0,
  selected_avatar text not null default 'a01',
  selected_log_skin text not null default 'wood',
  selected_tower_theme text not null default 'classic',
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  item_type text not null check (item_type in ('avatar','log_skin','tower_skin','emote','theme')),
  item_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (player_id, item_type, item_id)
);

create table if not exists public.match_history (
  id bigint generated always as identity primary key,
  player1_id uuid not null references public.players(id),
  player2_id uuid not null references public.players(id),
  winner_id uuid references public.players(id),
  duration_seconds integer not null default 0,
  p1_chips_earned integer not null default 0,
  p2_chips_earned integer not null default 0,
  p1_final_towers integer not null default 0,
  p2_final_towers integer not null default 0,
  played_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id bigint generated always as identity primary key,
  start_time timestamptz not null,
  end_time timestamptz not null,
  max_players integer not null default 64,
  status text not null default 'open' check (status in ('open','in_progress','finished')),
  winner_id uuid references public.players(id)
);

create table if not exists public.tournament_brackets (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  round integer not null,
  player1_id uuid references public.players(id),
  player2_id uuid references public.players(id),
  winner_id uuid references public.players(id)
);

create table if not exists public.achievements (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (player_id, achievement_id)
);

alter table public.players enable row level security;
alter table public.inventory enable row level security;
alter table public.match_history enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_brackets enable row level security;
alter table public.achievements enable row level security;

-- Players can read everyone (leaderboards) but only write themselves.
create policy "players_read" on public.players for select using (true);
create policy "players_insert_self" on public.players for insert with check (auth.uid() = id);
create policy "players_update_self" on public.players for update using (auth.uid() = id);

create policy "inventory_read_own" on public.inventory for select using (auth.uid() = player_id);
create policy "inventory_write_own" on public.inventory for insert with check (auth.uid() = player_id);

create policy "match_read" on public.match_history for select using (
  auth.uid() = player1_id or auth.uid() = player2_id
);
create policy "match_insert_svc" on public.match_history for insert with check (
  auth.uid() = player1_id or auth.uid() = player2_id
);

create policy "tourney_read" on public.tournaments for select using (true);
create policy "bracket_read" on public.tournament_brackets for select using (true);

create policy "ach_read_own" on public.achievements for select using (auth.uid() = player_id);
create policy "ach_write_own" on public.achievements for insert with check (auth.uid() = player_id);

-- Auto-create a player row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.players (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'Guest-' || substr(new.id::text, 1, 6)))
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
