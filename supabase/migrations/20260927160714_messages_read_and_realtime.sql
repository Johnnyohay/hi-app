-- Foundation for an inbox view and live message delivery.

alter table public.messages add column read_at timestamptz;

-- Recipients mark their own inbox read; nothing else about the update
-- policy needs to exist since only read_at should ever change this way.
create policy "members mark their own inbox read"
  on public.messages for update
  to authenticated
  using (auth.uid() = to_user_id)
  with check (auth.uid() = to_user_id);

-- Let clients subscribe to new/changed rows via postgres_changes, filtered
-- by RLS the same as any other read — a client only receives change events
-- for rows its own SELECT policy would return.
alter publication supabase_realtime add table public.messages;

alter table public.messages replica identity full;

-- Push notification device tokens. A user can have several (multiple
-- devices), so this is its own table rather than a column on profiles.
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

create policy "members manage their own push tokens"
  on public.push_tokens for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

