import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";
import { contactSchema, rendezVousSchema } from "@/lib/schemas";

function serverPublicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function getIp(): string | null {
  try {
    const req = getRequest();
    return (
      req?.headers.get("cf-connecting-ip") ||
      req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null
    );
  } catch {
    return null;
  }
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.hp) return { ok: false as const, error: "spam" };
    const sb = serverPublicClient();
    const { error } = await sb.from("contacts").insert({
      nom: data.nom,
      telephone: data.telephone || null,
      email: data.email,
      sujet: data.sujet,
      message: data.message,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const submitRendezVous = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rendezVousSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.hp) return { ok: false as const, error: "spam" };
    const sb = serverPublicClient();
    const { error } = await sb.from("rendez_vous").insert({
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      profil: data.profil || null,
      date_souhaitee: data.date_souhaitee,
      heure_souhaitee: data.heure_souhaitee,
      lieu: data.lieu || null,
      mode: data.mode,
      objet: data.objet,
      description: data.description || null,
      annonce_id: data.annonce_id || null,
    });
    if (error) return { ok: false as const, error: error.message };
    void getIp(); // reserved
    return { ok: true as const };
  });

export const listPartenaires = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverPublicClient();
  const { data, error } = await sb
    .from("partenaires")
    .select("id, nom, logo_url, url, description, ordre")
    .eq("actif", true)
    .order("ordre", { ascending: true });
  if (error) return [];
  return data ?? [];
});
