// Triggered by a database webhook (see the migration that creates the
// on_new_message_send_push trigger) whenever a row is inserted into
// public.messages. Looks up the recipient's registered device(s) and the
// sender's name, then pushes a notification through Expo's push service.
//
// To invoke locally for testing (simulating the webhook payload):
//
//   curl -i --location --request POST \
//     'http://127.0.0.1:54321/functions/v1/send-message-notification' \
//     --header 'Authorization: Bearer <service-role-key>' \
//     --header 'Content-Type: application/json' \
//     --data '{"type":"INSERT","table":"messages","record":{"id":"...","from_user_id":"...","to_user_id":"...","body":"hi","kind":"message"}}'

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type MessageRecord = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  body: string;
  kind: "message" | "nudge" | "help_request" | "reconnect";
};

type WebhookPayload = {
  type: "INSERT";
  table: "messages";
  record: MessageRecord;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req: Request) => {
  try {
    const payload = (await req.json()) as WebhookPayload;
    const message = payload.record;
    if (!message) return new Response("ok", { status: 200 });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
