create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  age_group text not null,
  primary_contact_id uuid references public.club_officials(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create policy "Teams are publicly readable"
  on public.teams for select using (true);

create policy "Admins can insert teams"
  on public.teams for insert with check (auth.role() = 'authenticated');

create policy "Admins can update teams"
  on public.teams for update using (auth.role() = 'authenticated');

create policy "Admins can delete teams"
  on public.teams for delete using (auth.role() = 'authenticated');
