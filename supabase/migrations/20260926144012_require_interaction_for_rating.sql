-- The ratings migration's own comment said ratings happen "after an
-- interaction," but nothing actually enforced that — any member could rate
-- any other member they'd never messaged, opening a review-bombing/
-- harassment vector with no precondition. Require at least one message
-- exchanged between the two people, checked via a security-definer function
-- for the same reason blocks needed one: the underlying messages table's
-- own RLS would otherwise hide the relevant rows from one side of the pair.

create or replace function public.has_messaged(user_a uuid, user_b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.messages
    where (from_user_id = user_a and to_user_id = user_b)
       or (from_user_id = user_b and to_user_id = user_a)
  );
$$;

revoke all on function public.has_messaged(uuid, uuid) from public;
grant execute on function public.has_messaged(uuid, uuid) to authenticated;

drop policy "members rate others" on public.ratings;

create policy "members rate others"
  on public.ratings for insert
  to authenticated
  with check (auth.uid() = rater_id and public.has_messaged(rater_id, rated_id));

drop policy "members update their own ratings" on public.ratings;

create policy "members update their own ratings"
  on public.ratings for update
  to authenticated
  using (auth.uid() = rater_id)
  with check (auth.uid() = rater_id and public.has_messaged(rater_id, rated_id));
