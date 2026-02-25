-- Notification audit log
-- Tracks every email notification sent by admins to club officials.

create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  sent_by      uuid not null references auth.users(id),
  subject      text not null,
  content_type text not null check (content_type in ('news', 'event', 'document', 'schedule')),
  content_id   text not null,
  scope        jsonb not null,
  sent_count   integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can read notifications"
  on public.notifications for select
  using (auth.role() = 'authenticated');
