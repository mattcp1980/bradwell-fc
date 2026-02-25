alter table public.news_posts
  add column if not exists post_to_facebook boolean not null default false;
