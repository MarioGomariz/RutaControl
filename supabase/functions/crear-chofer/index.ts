// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("ANON_KEY")!;

    // Validar que quien llama es admin (usa su access_token)
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const anonClient = createClient(url, anon);
    const { data: me } = await anonClient.auth.getUser(token);
    const uid = me?.user?.id;
    if (!uid) return new Response("No autenticado", { status: 401 });

    const srv = createClient(url, service);
    const { data: prof } = await srv.from("profiles").select("role").eq("id", uid).single();
    if (prof?.role !== "admin") return new Response("Forbidden", { status: 403 });

    const body = await req.json();
    const {
      email, password,
      nombre, apellido, dni, telefono,
      licencia, fecha_vencimiento_licencia, estado
    } = body;

    if (!email || !password) return new Response("email/password requeridos", { status: 400 });

    // 1) usuario de Auth
    const { data: created, error: e1 } = await srv.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if (e1) return new Response(e1.message, { status: 400 });
    const newUserId = created.user.id;

    // 2) fila en choferes
    const { error: e2 } = await srv.from("choferes").insert({
      user_id: newUserId, nombre, apellido, dni, telefono, email,
      licencia, fecha_vencimiento_licencia, estado
    });
    if (e2) return new Response(e2.message, { status: 400 });

    return new Response(JSON.stringify({ user_id: newUserId }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(String(e?.message || e), { status: 500 });
  }
});
