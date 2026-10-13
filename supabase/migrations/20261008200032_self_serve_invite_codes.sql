-- Turns invite codes from an admin-only, hand-run-via-SQL mechanism into a
-- real referral loop: every member can get their own reusable personal
-- code and see how many people joined through it.

alter table public.invite_codes
  add column owner_id uuid references auth.users (id) on delete cascade;

create table public.invite_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.invite_codes (code) on delete cascade,
  invited_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.invite_redemptions enable row level security;
-- Deliberately no policies here either — read only via my_invite_stats below.

-- Record which code a signup actually used. This has to run AFTER insert,
-- not inside the existing BEFORE trigger that validates and consumes the
-- code (see 20261002120000_invite_codes.sql): invited_user_id is a foreign
-- key to auth.users, and in a BEFORE trigger that row doesn't exist yet, so
-- the insert fails the constraint. Both triggers share one transaction, so
-- a failure in either still rolls the whole signup back.
create or replace function public.record_invite_redemption()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_code text;
begin
  invite_code := btrim(new.raw_user_meta_data ->> 'invite_code');

  insert into public.invite_redemptions (code, invited_user_id)
  values (invite_code, new.id);

  return new;
end;
$$;

create trigger record_invite_redemption_after_signup
  after insert on auth.users
  for each row execute function public.record_invite_redemption();

-- Returns the caller's own personal invite code, creating one (effectively
-- unlimited reuse) the first time they ask for it. One per member — a
-- unique partial index enforces that even under a race.
create unique index invite_codes_one_per_owner on public.invite_codes (owner_id) where owner_id is not null;

create or replace function public.get_or_create_my_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_code text;
  new_code text;
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  attempt int := 0;
begin
  select code into existing_code from public.invite_codes where owner_id = auth.uid();
  if existing_code is not null then
    return existing_code;
  end if;

  loop
    attempt := attempt + 1;
    new_code := '';
    for i in 1..8 loop
      new_code := new_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;

    begin
      insert into public.invite_codes (code, max_uses, owner_id) values (new_code, 1000000, auth.uid());
      return new_code;
    exception
      when unique_violation then
        if attempt > 10 then
          raise exception 'Could not generate a unique invite code — try again.';
        end if;
        -- another insert won the code string, or (one-time) the owner race: loop and retry.
    end;
  end loop;
end;
$$;

grant execute on function public.get_or_create_my_invite_code() to authenticated;

-- How many people joined using the caller's own code.
create or replace function public.my_invite_stats()
returns table (code text, invited_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select ic.code, count(ir.id) as invited_count
  from public.invite_codes ic
  left join public.invite_redemptions ir on ir.code = ic.code
  where ic.owner_id = auth.uid()
  group by ic.code;
$$;

grant execute on function public.my_invite_stats() to authenticated;
