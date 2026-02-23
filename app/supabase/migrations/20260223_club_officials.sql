create table public.club_officials (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  mobile text not null,
  role text not null check (role in ('admin', 'coach')),
  teams text[] not null default '{}',
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.club_officials enable row level security;

create policy "Officials can read all officials"
  on public.club_officials for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert officials"
  on public.club_officials for insert
  with check (auth.role() = 'authenticated');

create policy "Admins can update officials"
  on public.club_officials for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete officials"
  on public.club_officials for delete
  using (auth.role() = 'authenticated');
