import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequest } from "@tanstack/react-start/server";
import { annonceSchema, profileUpdateSchema } from "@/lib/schemas";
import { z } from "zod";

function reqMeta() {
  try {
    const req = getRequest();
    return {
      ip:
        req?.headers.get("cf-connecting-ip") ||
        req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        null,
      user_agent: req?.headers.get("user-agent") || null,
    };
  } catch {
    return { ip: null, user_agent: null };
  }
}

async function logActivity(
  sb: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  const meta = reqMeta();
  await sb.from("activity_log").insert({
    user_id: userId,
    action,
    metadata,
    ip: meta.ip,
    user_agent: meta.user_agent,
  });
}

export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, annoncesRes, rdvRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("annonces").select("id, titre, statut, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("rendez_vous").select("id, objet, date_souhaitee, statut, mode").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    return {
      profile: profileRes.data,
      annonces: annoncesRes.data ?? [],
      rendezVous: rdvRes.data ?? [],
      stats: {
        annonces: annoncesRes.data?.length ?? 0,
        annoncesValidees: annoncesRes.data?.filter((a) => a.statut === "validated").length ?? 0,
        rdv: rdvRes.data?.length ?? 0,
      },
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => profileUpdateSchema.parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update({
      prenom: data.prenom,
      nom: data.nom,
      telephone: data.telephone,
      region: data.region || null,
      commune: data.commune || null,
      adresse: data.adresse || null,
      bio: data.bio || null,
      avatar_url: data.avatar_url || null,
    }).eq("id", userId);
    if (error) throw new Error(error.message);
    await logActivity(supabase, userId, "profile_update");
    return { ok: true as const };
  });

export const createAnnonce = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => annonceSchema.parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("annonces").insert({
      user_id: userId,
      titre: data.titre,
      description: data.description,
      categorie: data.categorie || null,
      budget: data.budget || null,
      region: data.region || null,
      pieces_jointes: data.pieces_jointes,
    }).select("id").single();
    if (error) throw new Error(error.message);
    await logActivity(supabase, userId, "annonce_create", { annonce_id: row.id, titre: data.titre });
    return { ok: true as const, id: row.id };
  });

export const deleteMyAnnonce = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("annonces").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    await logActivity(supabase, userId, "annonce_delete", { annonce_id: data.id });
    return { ok: true as const };
  });

export const recordLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const meta = reqMeta();
    await supabase.from("profiles").update({
      derniere_connexion: new Date().toISOString(),
      last_ip: meta.ip,
      last_user_agent: meta.user_agent,
    }).eq("id", userId);
    // increment via RPC-like fallback
    const { data: p } = await supabase.from("profiles").select("nb_connexions").eq("id", userId).maybeSingle();
    await supabase.from("profiles").update({ nb_connexions: (p?.nb_connexions ?? 0) + 1 }).eq("id", userId);
    await logActivity(supabase, userId, "login");
    return { ok: true as const };
  });

export const recordLogout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await logActivity(context.supabase, context.userId, "logout");
    return { ok: true as const };
  });
