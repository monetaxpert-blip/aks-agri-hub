import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function ensureAdmin(sb: import("@supabase/supabase-js").SupabaseClient, userId: string) {
  const { data } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

async function logAudit(
  sb: import("@supabase/supabase-js").SupabaseClient,
  adminId: string,
  action: string,
  target?: { type: string; id: string },
  metadata: Record<string, unknown> = {},
) {
  await sb.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_type: target?.type ?? null,
    target_id: target?.id ?? null,
    metadata,
  });
}

// ---------- STATS ----------
export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const [
      profiles,
      annonces,
      rdv,
      loginsToday,
      newToday,
      recent,
    ] = await Promise.all([
      supabase.from("profiles").select("id, type_profil, statut, created_at"),
      supabase.from("annonces").select("id, statut, created_at"),
      supabase.from("rendez_vous").select("id, statut, created_at"),
      supabase.from("activity_log").select("id", { count: "exact", head: true }).eq("action", "login").gte("created_at", startToday),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startToday),
      supabase.from("activity_log").select("id, user_id, action, created_at, metadata").order("created_at", { ascending: false }).limit(15),
    ]);

    const ps = profiles.data ?? [];
    const asr = annonces.data ?? [];

    // 14-day series
    const days: { date: string; users: number; annonces: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        users: ps.filter((p) => p.created_at.slice(0, 10) === key).length,
        annonces: asr.filter((a) => a.created_at.slice(0, 10) === key).length,
      });
    }

    return {
      totals: {
        users: ps.length,
        agriculteurs: ps.filter((p) => p.type_profil === "agriculteur").length,
        etudiants: ps.filter((p) => p.type_profil === "etudiant").length,
        investisseurs: ps.filter((p) => p.type_profil === "investisseur").length,
        annonces: asr.length,
        annoncesPending: asr.filter((a) => a.statut === "pending").length,
        annoncesValidated: asr.filter((a) => a.statut === "validated").length,
        annoncesRejected: asr.filter((a) => a.statut === "rejected").length,
        rdv: rdv.data?.length ?? 0,
        rdvPending: rdv.data?.filter((r) => r.statut === "pending").length ?? 0,
        rdvPlanifie: rdv.data?.filter((r) => r.statut === "planifie").length ?? 0,
        loginsToday: loginsToday.count ?? 0,
        newToday: newToday.count ?? 0,
      },
      series: days,
      recent: recent.data ?? [],
    };
  });

// ---------- USERS ----------
export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      search: z.string().optional().default(""),
      type_profil: z.string().optional().default(""),
      region: z.string().optional().default(""),
      statut: z.string().optional().default(""),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    let q = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data.type_profil) q = q.eq("type_profil", data.type_profil as "agriculteur");
    if (data.region) q = q.ilike("region", `%${data.region}%`);
    if (data.statut) q = q.eq("statut", data.statut as "active");
    if (data.search) q = q.or(`prenom.ilike.%${data.search}%,nom.ilike.%${data.search}%,email.ilike.%${data.search}%,telephone.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Attach annonce counts
    const ids = (rows ?? []).map((r) => r.id);
    const counts: Record<string, number> = {};
    if (ids.length) {
      const { data: cs } = await supabase.from("annonces").select("user_id").in("user_id", ids);
      cs?.forEach((r) => { counts[r.user_id] = (counts[r.user_id] ?? 0) + 1; });
    }
    return (rows ?? []).map((r) => ({ ...r, nb_annonces: counts[r.id] ?? 0 }));
  });

export const getUserDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const [profile, annonces, rdv, activity] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("annonces").select("*").eq("user_id", data.id).order("created_at", { ascending: false }),
      supabase.from("rendez_vous").select("*").eq("user_id", data.id).order("created_at", { ascending: false }),
      supabase.from("activity_log").select("*").eq("user_id", data.id).order("created_at", { ascending: false }).limit(200),
    ]);
    return {
      profile: profile.data,
      annonces: annonces.data ?? [],
      rendezVous: rdv.data ?? [],
      activity: activity.data ?? [],
    };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid(), statut: z.enum(["active", "suspended"]) }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { error } = await supabase.from("profiles").update({ statut: data.statut }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, `user_${data.statut === "suspended" ? "suspend" : "reactivate"}`, { type: "user", id: data.id });
    return { ok: true as const };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, "user_delete", { type: "user", id: data.id });
    return { ok: true as const };
  });

export const updateUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      id: z.string().uuid(),
      prenom: z.string().max(80).optional(),
      nom: z.string().max(80).optional(),
      telephone: z.string().max(30).optional(),
      region: z.string().max(80).optional().nullable(),
      commune: z.string().max(80).optional().nullable(),
      adresse: z.string().max(300).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { id, ...patch } = data;
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, "user_update", { type: "user", id }, { patch });
    return { ok: true as const };
  });

// ---------- ANNONCES ----------
export const listAllAnnonces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ statut: z.string().optional().default("") }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    let q = supabase.from("annonces").select("*").order("created_at", { ascending: false });
    if (data.statut) q = q.eq("statut", data.statut as "pending");
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let profilesById: Record<string, { prenom: string | null; nom: string | null; email: string | null; telephone: string | null; type_profil: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, prenom, nom, email, telephone, type_profil").in("id", ids);
      profilesById = Object.fromEntries((profs ?? []).map((p) => [p.id, { prenom: p.prenom, nom: p.nom, email: p.email, telephone: p.telephone, type_profil: p.type_profil }]));
    }
    return (rows ?? []).map((r) => ({ ...r, profiles: profilesById[r.user_id] ?? null }));
  });

export const getAnnonceDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const [a, h] = await Promise.all([
      supabase.from("annonces").select("*, profiles:profiles!annonces_user_id_fkey(*)").eq("id", data.id).maybeSingle(),
      supabase.from("annonce_history").select("*").eq("annonce_id", data.id).order("created_at", { ascending: false }),
    ]);
    return { annonce: a.data, history: h.data ?? [] };
  });

export const moderateAnnonce = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      id: z.string().uuid(),
      statut: z.enum(["pending", "validated", "rejected", "archived"]),
      note: z.string().max(2000).optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { error } = await supabase.from("annonces").update({
      statut: data.statut,
      admin_notes: data.note ?? null,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("annonce_history").insert({
      annonce_id: data.id, admin_id: userId, action: `moderate:${data.statut}`,
      metadata: { note: data.note ?? null },
    });
    await logAudit(supabase, userId, `annonce_${data.statut}`, { type: "annonce", id: data.id });
    return { ok: true as const };
  });

// ---------- RDV ----------
export const listAllRendezVous = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { data } = await supabase.from("rendez_vous").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const updateRendezVous = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      id: z.string().uuid(),
      statut: z.enum(["pending", "planifie", "termine", "annule"]).optional(),
      mode: z.enum(["presentiel", "visio", "whatsapp"]).optional(),
      lieu: z.string().max(300).optional().nullable(),
      admin_notes: z.string().max(2000).optional().nullable(),
      date_souhaitee: z.string().optional(),
      heure_souhaitee: z.string().optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { id, ...patch } = data;
    const { error } = await supabase.from("rendez_vous").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, "rdv_update", { type: "rdv", id }, patch);
    return { ok: true as const };
  });

export const scheduleRdvFromAnnonce = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      annonce_id: z.string().uuid(),
      date_souhaitee: z.string(),
      heure_souhaitee: z.string(),
      mode: z.enum(["presentiel", "visio", "whatsapp"]),
      lieu: z.string().max(300).optional(),
      objet: z.string().min(2).max(200),
      description: z.string().max(3000).optional(),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { data: an } = await supabase.from("annonces")
      .select("user_id, titre, profiles:profiles!annonces_user_id_fkey(nom, prenom, email, telephone)")
      .eq("id", data.annonce_id).maybeSingle();
    if (!an) throw new Error("Annonce introuvable");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = an.profiles ?? {};
    const { error } = await supabase.from("rendez_vous").insert({
      user_id: an.user_id,
      annonce_id: data.annonce_id,
      nom: `${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || "Utilisateur",
      email: p.email ?? "n/a",
      telephone: p.telephone ?? "n/a",
      date_souhaitee: data.date_souhaitee,
      heure_souhaitee: data.heure_souhaitee,
      mode: data.mode,
      lieu: data.lieu ?? null,
      objet: data.objet,
      description: data.description ?? null,
      statut: "planifie",
    });
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, "rdv_scheduled_from_annonce", { type: "annonce", id: data.annonce_id });
    return { ok: true as const };
  });

// ---------- CONTACTS ----------
export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data } = await context.supabase.from("contacts").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

// ---------- PARTENAIRES ----------
export const upsertPartenaire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      nom: z.string().min(2).max(200),
      url: z.string().max(500).optional().nullable(),
      description: z.string().max(2000).optional().nullable(),
      logo_url: z.string().max(500).optional().nullable(),
      ordre: z.number().int().default(0),
      actif: z.boolean().default(true),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await supabase.from("partenaires").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("partenaires").insert(data);
      if (error) throw new Error(error.message);
    }
    await logAudit(supabase, userId, "partenaire_upsert", data.id ? { type: "partenaire", id: data.id } : undefined);
    return { ok: true as const };
  });

export const deletePartenaire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const { error } = await supabase.from("partenaires").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(supabase, userId, "partenaire_delete", { type: "partenaire", id: data.id });
    return { ok: true as const };
  });

export const listAllPartenaires = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data } = await context.supabase.from("partenaires").select("*").order("ordre");
    return data ?? [];
  });

// ---------- AUDIT ----------
export const listAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      user_id: z.string().uuid().optional(),
      action: z.string().optional(),
      limit: z.number().int().min(1).max(500).default(200),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    let q = supabase.from("activity_log")
      .select("*, profiles:profiles!activity_log_user_id_fkey(prenom, nom, email)")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.user_id) q = q.eq("user_id", data.user_id);
    if (data.action) q = q.eq("action", data.action);
    const { data: rows } = await q;
    const { data: adminRows } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(data.limit);
    return { activity: rows ?? [], admin: adminRows ?? [] };
  });

// ---------- EXPORT CSV ----------
export const exportUsersCSV = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      type_profil: z.string().optional().default(""),
      region: z.string().optional().default(""),
      statut: z.string().optional().default(""),
      from: z.string().optional().default(""),
      to: z.string().optional().default(""),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    let q = supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data.type_profil) q = q.eq("type_profil", data.type_profil as "agriculteur");
    if (data.region) q = q.ilike("region", `%${data.region}%`);
    if (data.statut) q = q.eq("statut", data.statut as "active");
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const ids = (rows ?? []).map((r) => r.id);
    const counts: Record<string, number> = {};
    if (ids.length) {
      const { data: cs } = await supabase.from("annonces").select("user_id").in("user_id", ids);
      cs?.forEach((r) => { counts[r.user_id] = (counts[r.user_id] ?? 0) + 1; });
    }

    const header = ["Nom", "Prénom", "Email", "Téléphone", "Profil", "Région", "Commune", "Date d'inscription", "Dernière connexion", "Nombre d'annonces", "Statut"];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(";")];
    for (const r of rows ?? []) {
      lines.push([
        r.nom, r.prenom, r.email, r.telephone, r.type_profil,
        r.region, r.commune,
        r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "",
        r.derniere_connexion ? new Date(r.derniere_connexion).toISOString() : "",
        counts[r.id] ?? 0,
        r.statut,
      ].map(esc).join(";"));
    }
    await logAudit(supabase, userId, "export_csv_users", undefined, { filters: data, count: rows?.length ?? 0 });
    return { csv: "\uFEFF" + lines.join("\n"), count: rows?.length ?? 0 };
  });
