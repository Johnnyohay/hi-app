-- Gates signup behind an invite code, so the app can stay open to the public
-- (no app-store account, no approval queue) while still limiting who can
-- actually create an account to people someone already in has vouched for.
--
-- Enforced with a BEFORE INSERT trigger on auth.users rather than a client-
-- side check, so it can't be bypassed by calling the signup API directly —
-- an invalid or exhausted code aborts the entire signup transaction.

create table public.invite_codes (
  code text primary key,
  max_uses int not null default 1,
  uses int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;
-- Deliberately no policies: nobody reads or writes this table directly from
-- the client. It's only ever touched by the security-definer trigger below.

create or replace function public.enforce_invite_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_code text;
begin
  invite_code := new.raw_user_meta_data ->> 'invite_code';

  if invite_code is null or btrim(invite_code) = '' then
    raise exception 'An invite code is required.';
  end if;

  update public.invite_codes
    set uses = uses + 1
    where code = btrim(invite_code) and uses < max_uses;

  if not found then
    raise exception 'That invite code is invalid or has already been used.';
  end if;

  return new;
end;
$$;

create trigger enforce_invite_code_before_signup
  before insert on auth.users
  for each row execute function public.enforce_invite_code();

-- GoTrue (the auth server) masks every trigger exception behind a generic
-- "Database error saving new user" — it never forwards the real message to
-- the client. So the app checks a code is valid *before* calling signUp,
-- via this RPC, to show a real error ("that code isn't valid") instead of
-- a dead end. The trigger above remains the actual, non-bypassable
-- enforcement — this is only for a clean error message.
create or replace function public.is_invite_code_valid(code_to_check text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.invite_codes
    where code = btrim(code_to_check) and uses < max_uses
  );
$$;

grant execute on function public.is_invite_code_valid(text) to anon, authenticated;
