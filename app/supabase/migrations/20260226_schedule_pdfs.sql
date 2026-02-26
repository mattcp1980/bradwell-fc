-- Public storage bucket for emailed training schedule PDFs
insert into storage.buckets (id, name, public)
  values ('schedule-pdfs', 'schedule-pdfs', true)
  on conflict (id) do nothing;

create policy "Schedule PDFs are publicly readable"
  on storage.objects for select
  using (bucket_id = 'schedule-pdfs');

create policy "Edge functions can upload schedule PDFs"
  on storage.objects for insert
  with check (bucket_id = 'schedule-pdfs');
