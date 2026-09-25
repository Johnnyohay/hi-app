-- Bug fix: the messages INSERT policy checked `blocks` with a raw subquery,
-- but that subquery runs under the *sender's* own row-level permissions —
-- and blocks' own RLS only lets someone see blocks where *they* are the
-- blocker. So a sender could never see that the recipient had blocked them,
-- and the check silently passed in that direction. A security definer
-- function bypasses per-row RLS to answer the yes/no question correctly
-- without exposing which specific rows exist to either party.

create or replace function public.is_blocked_between(user_a uuid, user_b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = user_a and blocked_id = user_b)
       or (blocker_id = user_b and blocked_id = user_a)
  );
$$;

revoke all on function public.is_blocked_between(uuid, uuid) from public;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated;

drop policy "members send messages as themselves" on public.messages;

create policy "members send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = from_user_id
    and not public.is_blocked_between(from_user_id, to_user_id)
  );
