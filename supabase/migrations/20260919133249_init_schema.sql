-- Core schema for Hi: profiles (the network directory), messages (threads),
-- and asks (what people have posted through the Ask tab).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role text not null default '',
  city text not null default '',
  lat double precision,
  lng double precision,
  photo_url text,
  bio text not null default '',
  offer_category text,
  offer_text text not null default '',
  skills text[] not null default '{}',
  current_ask text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users (id) on delete cascade,
  to_user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  kind text not null default 'message' check (kind in ('message', 'nudge', 'help_request', 'reconnect')),
  created_at timestamptz not null default now()
);

create index messages_thread_idx on public.messages (least(from_user_id, to_user_id), greatest(from_user_id, to_user_id), created_at);

create table public.asks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  need_text text not null,
  created_at timestamptz not null default now()
);

-- Every signed-in member can see the whole directory (this *is* the network),
-- but can only ever write their own row.
alter table public.profiles enable row level security;

create policy "profiles are visible to signed-in members"
  on public.profiles for select
  to authenticated
  using (true);

create policy "members manage their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "members update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Messages are only visible to the two people in the thread.
alter table public.messages enable row level security;

create policy "members read their own threads"
  on public.messages for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "members send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = from_user_id);

-- Asks are visible network-wide (that's how matching works) but only the
-- author can create theirs.
alter table public.asks enable row level security;

create policy "asks are visible to signed-in members"
  on public.asks for select
  to authenticated
  using (true);

create policy "members post their own asks"
  on public.asks for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Auto-create a bare profile row the moment someone signs up, seeded from
-- whatever the signup call passed in (OAuth name/photo, if any).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, photo_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
