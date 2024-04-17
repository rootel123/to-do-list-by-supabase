import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization")!;
  const { toDoId, content } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: existToDoData } = await supabase.from("to_do_list").select().eq(
    "id",
    toDoId,
  )
    .limit(1).single();

  if (!existToDoData || user?.id !== existToDoData.user_id) {
    return new Response(
      JSON.stringify({
        message: "Wrong user",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }

  const { data: updatedToDoData } = await supabase.from("to_do_list").update({
    content,
  }).eq("id", toDoId).select().single(); //single을 하지 않았을때는 결과값이 배열에 담겨 나온다. || 했을 경우 객체로 나온다.

  return new Response(JSON.stringify(updatedToDoData), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
