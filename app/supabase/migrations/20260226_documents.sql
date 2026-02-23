create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  file_url     text not null,
  file_path    text not null,
  category     text not null default '',
  audience     text not null check (audience in ('admin', 'parents', 'general')),
  uploaded_by  uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

alter table public.documents enable row level security;

-- Authenticated users (admins/coaches) can read all documents
create policy "Authenticated users can read all documents"
  on public.documents for select
  using (auth.role() = 'authenticated');

-- Unauthenticated users can read parents + general documents (parent portal)
create policy "Public can read parents and general documents"
  on public.documents for select
  using (audience in ('parents', 'general'));

create policy "Authenticated users can insert documents"
  on public.documents for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete documents"
  on public.documents for delete using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('documents', 'documents', true)
  on conflict (id) do nothing;

create policy "Documents are publicly readable"
  on storage.objects for select using (bucket_id = 'documents');

create policy "Authenticated users can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Authenticated users can delete documents from storage"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.role() = 'authenticated');
