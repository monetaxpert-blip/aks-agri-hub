import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ensureAdmin(sb: import("@supabase/supabase-js").SupabaseClient, userId: string) {
  const { data } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Accès refusé");
}

async function logAudit(
  sb: import("@supabase/supabase-js").SupabaseClient,
  adminId: string,
  action: string,
  targetId: string,
  metadata: Record<string, unknown> = {},
) {
  await sb.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_type: "publicite",
    target_id: targetId,
    metadata,
  });
}

export const listAllPublicites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ statut: z.string().optional().default("") }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    let q = supabase.from("publicites").select("*").order("created_at", { ascending: false });
    if (data.statut) q = q.eq("statut", data.statut as "pending");
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let byId: Record<string, { entreprise: string | null; responsable: string | null; email: string | null; telephone: string | null }> = {};
    if (ids.length) {
      const { data: det } = await supabase
        .from("annonceur_details")
        .select("user_id, entreprise, responsable, email, telephone")
        .in("user_id", ids);
      byId = Object.fromEntries((det ?? []).map((d) => [d.user_id, { entreprise: d.entreprise, responsable: d.responsable, email: d.email, telephone: d.telephone }]));
    }
    return (rows ?? []).map((r) => ({ ...r, annonceur: byId[r.user_id] ?? null }));
  });

export const moderatePublicite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        statut: z.enum(["pending", "approved", "published", "rejected", "expired", "suspended"]),
        note: z.string().max(2000).optional(),
        date_debut: z.string().max(40).optional().or(z.literal("")),
        date_fin: z.string().max(40).optional().or(z.literal("")),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const patch: Record<string, unknown> = { statut: data.statut };
    if (data.note !== undefined) patch['admin_notes'] = data.note || null;
    if (data.date_debut !== undefined) patch['date_debut'] = data.date_debut || null;
    if (data.date_fin !== undefined) patch['date_fin'] = data.date_fin || null;
    const { error } = await supabase.from("publicites").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, `publicite_${data.statut}`, data.id, { note: data.note ?? null });
    return { ok: true as const };
  });

export const deletePubliciteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { data: row } = await supabase.from("publicites").select("media_path").eq("id", data.id).maybeSingle();
    const { error } = await supabase.from("publicites").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (row?.media_path) await supabase.storage.from("publicites").remove([row.media_path]);
    await logAudit(supabase, userId, "publicite_delete", data.id);
    return { ok: true as const };
  });
