-- Phase 1: no photos, no domain gate, demo-account tagging.

alter table public.profiles drop column photo_url;

alter table public.profiles add column is_demo boolean not null default false;

-- Re-created (not edited in place) to stop copying avatar_url from OAuth
-- providers now that the app doesn't store photos at all.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
