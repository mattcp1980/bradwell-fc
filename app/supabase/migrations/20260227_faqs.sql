-- FAQ items for the coach portal
-- audience: 'coaches' — shown to officials on the Coach Hub
-- audience: 'parents' — parent-facing content shown on the Coach Hub
-- display_order: lower = earlier in list

create table public.faqs (
  id             uuid primary key default gen_random_uuid(),
  question       text not null,
  answer         text not null,
  audience       text not null check (audience in ('coaches', 'parents')),
  display_order  integer not null default 0 check (display_order >= 0),
  created_at     timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "Authenticated users can read faqs"
  on public.faqs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert faqs"
  on public.faqs for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update faqs"
  on public.faqs for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete faqs"
  on public.faqs for delete
  using (auth.role() = 'authenticated');
