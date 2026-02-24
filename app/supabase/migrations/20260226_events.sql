-- Events calendar
-- Events are created by admins and displayed on the homepage.
-- required_attendance = true → shown in coach portal + email notification sent.

create table public.events (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  description        text not null default '',
  event_date         date not null,
  start_time         time,
  end_time           time,
  location           text not null default '',
  required_attendance boolean not null default false,
  status             text not null default 'draft' check (status in ('draft', 'published')),
  created_by         uuid not null references auth.users(id) on delete cascade,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.events enable row level security;

-- Public can read published events
create policy "Public can read published events"
  on public.events for select
  using (status = 'published');

-- Authenticated users can read all events (admin dashboard)
create policy "Authenticated users can read all events"
  on public.events for select
  using (auth.role() = 'authenticated');

-- Authenticated users can create events
create policy "Authenticated users can insert events"
  on public.events for insert
  with check (auth.role() = 'authenticated');

-- Authenticated users can update events
create policy "Authenticated users can update events"
  on public.events for update
  using (auth.role() = 'authenticated');

-- Authenticated users can delete events
create policy "Authenticated users can delete events"
  on public.events for delete
  using (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function public.touch_events_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on public.events
  for each row execute procedure public.touch_events_updated_at();
