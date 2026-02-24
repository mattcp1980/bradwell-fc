-- Add 'coaches' as a valid audience value on the documents table.
-- Coaches audience: visible to authenticated admins and coaches (not public).
-- Replaces the existing check constraint.

alter table public.documents
  drop constraint if exists documents_audience_check;

alter table public.documents
  add constraint documents_audience_check
  check (audience in ('admin', 'coaches', 'parents', 'general'));
