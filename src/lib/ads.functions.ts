import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { annonceurDetailsSchema, publiciteSchema } from "@/lib/schemas";

export const getMyAnnonceurSpace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [details, pubs] = await Promise.all([
      supabase.from("annonceur_details").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("publicites").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    const rows = pubs.data ?? [];
    return {
      details: details.data,
      publicites: rows,
      stats: {
        total: rows.length,
        pending: rows.filter((p) => p.statut === "pending").length,
        published: rows.filter((p) => p.statut === "published").length,
        rejected: rows.filter((p) => p.statut === "rejected").length,
      },
    };
  });

export const saveAnnonceurDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => annonceurDetailsSchema.parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("annonceur_details").upsert({
      user_id: userId,
      entreprise: data.entreprise,
      responsable: data.responsable || null,
      email: data.email || null,
      telephone: data.telephone || null,
      secteur_activite: data.secteur_activite || null,
      localisation: data.localisation || null,
      description: data.description || null,
      logo_url: data.logo_url || null,
      site_web: data.site_web || null,
      infos_complementaires: data.infos_complementaires || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const createPublicite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => publiciteSchema.parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("publicites")
      .insert({
        user_id: userId,
        titre: data.titre,
        description: data.description || null,
        media_type: data.media_type,
        media_url: data.media_url,
        media_path: data.media_path || null,
        placement: data.placement,
        lien_url: data.lien_url || null,
        contact_nom: data.contact_nom || null,
        contact_email: data.contact_email || null,
        contact_telephone: data.contact_telephone || null,
        periode_souhaitee_debut: data.periode_souhaitee_debut || null,
        periode_souhaitee_fin: data.periode_souhaitee_fin || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("activity_log").insert({
      user_id: userId,
      action: "publicite_create",
      metadata: { publicite_id: row.id, titre: data.titre },
    });
    return { ok: true as const, id: row.id };
  });

export const deleteMyPublicite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("publicites")
      .select("media_path")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    const { error } = await supabase.from("publicites").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    if (row?.media_path) await supabase.storage.from("publicites").remove([row.media_path]);
    return { ok: true as const };
  });
