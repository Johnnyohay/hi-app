-- Lets members rate people after an interaction — stars plus one optional
-- preset descriptor, deliberately no free text, so feedback stays
-- constructive rather than becoming a place to vent. One rating per pair,
-- re-rating updates it rather than piling up duplicates.

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references auth.users (id) on delete cascade,
  rated_id uuid not null references auth.users (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  feedback_tag text check (
    feedback_tag in (
      'amazing_supportive',
      'nice_approach',
      'quick_helpful',
      'didnt_feel_substantial',
      'unresponsive'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ratings_no_self_rating check (rater_id <> rated_id),
  constraint ratings_one_per_pair unique (rater_id, rated_id)
);

alter table public.ratings enable row level security;

-- Visible to the two people involved only — not a public leaderboard.
create policy "members see ratings they gave or received"
  on public.ratings for select
  to authenticated
  using (auth.uid() = rater_id or auth.uid() = rated_id);

create policy "members rate others"
  on public.ratings for insert
  to authenticated
  with check (auth.uid() = rater_id);

create policy "members update their own ratings"
  on public.ratings for update
  to authenticated
  using (auth.uid() = rater_id)
  with check (auth.uid() = rater_id);

create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();
