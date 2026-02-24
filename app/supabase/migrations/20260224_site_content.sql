-- Site content key/value store for admin-editable public-facing text.
-- Keys are unique strings; values are plain text (multiline allowed).

create table public.site_content (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Anyone can read site content (it's public-facing copy)
create policy "Public can read site content"
  on public.site_content for select
  using (true);

-- Only authenticated users (admins) can update
create policy "Authenticated users can update site content"
  on public.site_content for update
  using (auth.role() = 'authenticated');

-- Only authenticated users can insert (seed rows)
create policy "Authenticated users can insert site content"
  on public.site_content for insert
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Seed default content
-- ---------------------------------------------------------------------------

insert into public.site_content (key, value) values
  -- About section
  ('about_heading',             'More Than A Club'),
  ('about_body_1',              'Bradwell FC is a grassroots youth football club dedicated to providing a safe, inclusive, and enjoyable environment for young players to develop their football skills and grow as individuals.'),
  ('about_body_2',              'Run by FA-qualified volunteer coaches, we welcome players of all abilities and are proud to be part of the local football community.'),
  ('about_value_community',     'Building friendships and teamwork both on and off the pitch.'),
  ('about_value_development',   'Helping every player improve their skills and confidence.'),
  ('about_value_enjoyment',     'Making sure every child has fun and loves the game.'),
  ('about_value_respect',       'Fair play, sportsmanship, and respect for all.'),

  -- Parents page info cards
  ('parents_training_times',    'Training sessions run throughout the week across all age groups. Check with your team manager for specific days and times.'),
  ('parents_venues',            'Home matches and training take place at Bradwell Park. Away fixture details are shared by team managers ahead of match day.'),
  ('parents_safeguarding',      'The welfare of every child is our priority. All coaches are DBS checked and FA safeguarding trained. Contact our Welfare Officer with any concerns.'),
  ('parents_club_policies',     'Our code of conduct, anti-bullying policy, and respect programme documents are available from your team manager or the club secretary.'),
  ('parents_match_days',        'Please arrive 15 minutes before kick-off. Ensure your child has shin pads, boots, and their kit. We encourage positive touchline behaviour from all supporters.'),
  ('parents_get_in_touch',      'Questions? Reach out to your team manager directly, or contact the club via our social media channels or email.'),
  ('parents_make_a_payment_url','https://bradwell-fc.hivelink.co.uk/451/'),

  -- Footer / contact
  ('contact_email',             'info@bradwellfc.co.uk'),
  ('contact_address',           'Bradwell Park, Bradwell'),
  ('footer_tagline',            'A grassroots youth football club building players and community since 2000.')

on conflict (key) do nothing;
