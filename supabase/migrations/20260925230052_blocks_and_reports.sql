-- Safety features: blocking (enforced server-side, not just hidden in the
-- UI) and reporting (visible only to the reporter and, implicitly, the app
-- operator via the dashboard — never to the person being reported).

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_no_self_block check (blocker_id <> blocked_id),
  constraint blocks_one_per_pair unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

-- Only the blocker can ever see, create, or remove their own blocks — the
-- blocked person has no way to discover they've been blocked via the API.
create policy "members manage their own blocks"
  on public.blocks for all
  to authenticated
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (
    reason in ('harassment', 'spam', 'fake_profile', 'inappropriate_content', 'safety_concern', 'other')
  ),
  details text not null default '',
  created_at timestamptz not null default now(),
  constraint reports_no_self_report check (reporter_id <> reported_id)
);

alter table public.reports enable row level security;

create policy "members file reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Reporters can see their own submission history; nobody can see a report
-- filed against them. Reviewing reports is an operator/dashboard action
-- (service role), not an in-app feature.
create policy "members see their own reports"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

-- Enforced at the database level, not just hidden client-side: once either
-- party has blocked the other, no new message can be inserted between them.
drop policy "members send messages as themselves" on public.messages;

create policy "members send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = from_user_id
    and not exists (
      select 1 from public.blocks
      where blocker_id = to_user_id and blocked_id = from_user_id
    )
    and not exists (
      select 1 from public.blocks
      where blocker_id = from_user_id and blocked_id = to_user_id
    )
  );
