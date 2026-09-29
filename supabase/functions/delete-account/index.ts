// Permanently deletes the calling user's account: their auth.users row
// (which cascades to profiles, messages, asks, ratings, blocks, reports,
// and push_tokens via the schema's own ON DELETE CASCADE constraints) plus
// any avatar files in Storage, which aren't foreign-keyed and would
// otherwise be orphaned.
//
// The caller is identified from their own access token, never from a
// client-supplied id — verify_jwt is on for this function (see
// supabase/config.toml), and this handler re-derives the user from that
// same token via auth.getUser() before touching anything.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("missing authorization", { status: 401 });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();
    if (userError || !user) return new Response("invalid session", { status: 401 });

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: avatarFiles } = await admin.storage.from("avatars").list(user.id);
    if (avatarFiles && avatarFiles.length > 0) {
      await admin.storage.from("avatars").remove(avatarFiles.map((file) => `${user.id}/${file.name}`));
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return Response.json({ deleted: true });
  } catch (error) {
    console.error("delete-account error", error);
    return new Response(String(error), { status: 500 });
  }
});
