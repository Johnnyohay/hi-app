-- Security fix: send-message-notification runs with verify_jwt = false and
-- trusted whatever {record} it was sent, so anyone who knew its URL could
-- push arbitrary text, under any sender's name, to any member's phone.
--
-- The trigger now authenticates itself with a shared secret, read at call
-- time from Supabase Vault so it never appears in a migration or in git.
-- The function checks the same secret (its NOTIFY_WEBHOOK_SECRET env
-- secret) and re-reads the message from the database by id, so the trigger
-- only needs to send the id.
--
-- One-time setup per project (already done for production), with the same
-- value in both places:
--   select vault.create_secret('<secret>', 'notify_webhook_secret');
--   supabase secrets set NOTIFY_WEBHOOK_SECRET=<secret>
--
-- If the Vault secret is missing, the trigger skips the notification and
-- logs a warning rather than failing the message insert itself.

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'notify_webhook_secret';

  if webhook_secret is null then
    raise warning 'notify_webhook_secret is missing from Vault; skipping push notification for message %', new.id;
    return new;
  end if;

  perform net.http_post(
    url := 'https://qytjvpwyfoelrfumizlf.supabase.co/functions/v1/send-message-notification',
    body := jsonb_build_object('type', 'INSERT', 'table', 'messages', 'record', jsonb_build_object('id', new.id)),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;
