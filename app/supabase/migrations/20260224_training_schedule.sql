-- Training schedule builder.
-- One active schedule at a time (published replaces previous).
-- Slots: day + time range + venue/pitch + team.

create table public.training_schedules (
  id               uuid primary key default gen_random_uuid(),
  name             text not null default 'Training Schedule',
  status           text not null default 'draft' check (status in ('draft', 'published')),
  pitch_image_url  text,
  pitch_image_path text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.training_schedules enable row level security;

create policy "Public can read published schedules"
  on public.training_schedules for select
  using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can insert schedules"
  on public.training_schedules for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update schedules"
  on public.training_schedules for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete schedules"
  on public.training_schedules for delete
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------

create table public.training_slots (
  id          uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.training_schedules(id) on delete cascade,
  day         text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  start_time  text not null,  -- e.g. '18:00'
  end_time    text not null,  -- e.g. '19:00'
  venue       text not null default '',  -- e.g. 'Bradwell Park, Pitch 1'
  team_id     uuid references public.teams(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.training_slots enable row level security;

create policy "Public can read slots for published schedules"
  on public.training_slots for select
  using (
    auth.role() = 'authenticated'
    or schedule_id in (
      select id from public.training_schedules where status = 'published'
    )
  );

create policy "Authenticated users can insert slots"
  on public.training_slots for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update slots"
  on public.training_slots for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete slots"
  on public.training_slots for delete
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage bucket for pitch layout images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('schedule-images', 'schedule-images', true)
  on conflict (id) do nothing;

create policy "Schedule images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'schedule-images');

create policy "Authenticated users can upload schedule images"
  on storage.objects for insert
  with check (bucket_id = 'schedule-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete schedule images"
  on storage.objects for delete
  using (bucket_id = 'schedule-images' and auth.role() = 'authenticated');
