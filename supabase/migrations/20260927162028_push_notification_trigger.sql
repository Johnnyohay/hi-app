-- Automatically calls the send-message-notification Edge Function whenever
-- a message is inserted. This project doesn't have the supabase_functions
-- schema (that helper is only provisioned when a Database Webhook is first
-- created via the dashboard UI), so this calls pg_net's net.http_post
-- directly and builds the same {type, table, record} envelope the edge
-- function expects. The Authorization header only needs to satisfy the
-- function's own gateway-level JWT check — the anon key is fine for that
-- (it's meant to be public, unlike a service-role key), since the function
-- itself uses its auto-injected SUPABASE_SERVICE_ROLE_KEY for the actual
-- privileged database reads, never anything passed in this header.
--
-- The URL is necessarily project-specific (local Postgres can't reach a
-- hosted function, and vice versa), so this targets production. Harmless on
-- local — it would just call the production endpoint — but not the
-- intended local behavior.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://qytjvpwyfoelrfumizlf.supabase.co/functions/v1/send-message-notification',
    body := jsonb_build_object('type', 'INSERT', 'table', 'messages', 'record', to_jsonb(new)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dGp2cHd5Zm9lbHJmdW1pemxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzQ1NDEsImV4cCI6MjEwNTkxMDU0MX0.gIZDwN6VGxqGJAYYZxTsNzbPSL5O4672fwVbuagwOKM'
    ),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

create trigger on_new_message_send_push
  after insert on public.messages
  for each row
  execute function public.notify_new_message();
