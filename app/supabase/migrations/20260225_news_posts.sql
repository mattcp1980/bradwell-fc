create type public.news_post_status as enum ('draft', 'published', 'scheduled');

create table public.news_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  excerpt         text not null default '',
  body            text not null default '',
  cover_image_url text,
  images          text[] not null default '{}',
  status          public.news_post_status not null default 'draft',
  scheduled_at    timestamptz,
  author_id       uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at on every row update
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger news_posts_set_updated_at
  before update on public.news_posts
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.news_posts enable row level security;

create policy "Published articles are publicly readable"
  on public.news_posts for select
  using (
    status = 'published'
    or (status = 'scheduled' and scheduled_at is not null and scheduled_at <= now())
  );

create policy "Authenticated users can read all articles"
  on public.news_posts for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert articles"
  on public.news_posts for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update articles"
  on public.news_posts for update
  using (auth.role() = 'authenticated');

create policy "Authenticated users can delete articles"
  on public.news_posts for delete
  using (auth.role() = 'authenticated');

-- Storage bucket for news images
insert into storage.buckets (id, name, public)
  values ('news-images', 'news-images', true)
  on conflict (id) do nothing;

create policy "News images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'news-images');

create policy "Authenticated users can upload news images"
  on storage.objects for insert
  with check (bucket_id = 'news-images' and auth.role() = 'authenticated');

create policy "Authenticated users can delete news images"
  on storage.objects for delete
  using (bucket_id = 'news-images' and auth.role() = 'authenticated');
