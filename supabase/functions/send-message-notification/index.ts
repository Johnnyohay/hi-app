// Called by the on_new_message_send_push database trigger whenever a row is
// inserted into public.messages. Looks up the recipient's registered
// device(s) and the sender's name, then pushes a notification through
// Expo's push service.
//
// This function is deployed with verify_jwt = false (the trigger has no user
// session to send), so it authenticates its caller itself:
//   1. The request must carry the shared secret in the x-webhook-secret
//      header. The trigger reads it from Supabase Vault
//      (notify_webhook_secret); this function reads it from its own
//      NOTIFY_WEBHOOK_SECRET secret. Without it, anyone who knew the URL
//      could push arbitrary text to any member's phone.
//   2. Only the message id is taken from the request. Everything shown in
//      the notification (sender, recipient, text) is re-read from the
//      database, and only for messages created in the last few minutes, so
//      even a leaked secret can't be used to send made-up content or to
//      replay old messages.
//
// To invoke locally for testing:
//
//   curl -i --location --request POST \
//     'http://127.0.0.1:54321/functions/v1/send-message-notification' \
//     --header 'x-webhook-secret: <NOTIFY_WEBHOOK_SECRET>' \
//     --header 'Content-Type: application/json' \
//     --data '{"type":"INSERT","table":"messages","record":{"id":"<message id>"}}'

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type WebhookPayload = {
  type: "INSERT";
  table: "messages";
  record: { id?: string };
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_MESSAGE_AGE_MS = 10 * 60 * 1000;

// Compares in time independent of where the strings first differ.
function secretsMatch(given: string, expected: string): boolean {
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  try {
    const expectedSecret = Deno.env.get("NOTIFY_WEBHOOK_SECRET");
    if (!expectedSecret) {
      console.error("send-message-notification: NOTIFY_WEBHOOK_SECRET is not set");
      return new Response("not configured", { status: 500 });
    }
    if (!secretsMatch(req.headers.get("x-webhook-secret") ?? "", expectedSecret)) {
      return new Response("unauthorized", { status: 401 });
    }

    const payload = (await req.json()) as WebhookPayload;
    const messageId = payload.record?.id;
    if (!messageId) return new Response("ok", { status: 200 });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: message } = await supabaseAdmin
      .from("messages")
      .select("id, from_user_id, to_user_id, body, kind, created_at")
      .eq("id", messageId)
      .maybeSingle();
    if (!message) return new Response("no such message", { status: 200 });
    if (Date.now() - new Date(message.created_at).getTime() > MAX_MESSAGE_AGE_MS) {
      return new Response("message too old to notify", { status: 200 });
    }

    const [{ data: tokens }, { data: sender }] = await Promise.all([
      supabaseAdmin.from("push_tokens").select("token").eq("user_id", message.to_user_id),
      supabaseAdmin.from("profiles").select("name").eq("id", message.from_user_id).maybeSingle(),
    ]);

    if (!tokens || tokens.length === 0) {
      return new Response("no registered device", { status: 200 });
    }

    const senderName = sender?.name || "Someone";
    const title =
      message.kind === "nudge" ? `${senderName} sent you a nudge` : `New message from ${senderName}`;

    const notifications = tokens.map((row) => ({
      to: row.token,
      title,
      body: message.body,
      data: { threadUserId: message.from_user_id },
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(notifications),
    });

    const result = await response.json();
    return Response.json({ sent: notifications.length, expoResult: result });
  } catch (error) {
    console.error("send-message-notification error", error);
    return new Response(String(error), { status: 500 });
  }
});
