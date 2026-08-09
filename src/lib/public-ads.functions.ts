import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicAd = {
  id: string;
  titre: string;
  description: string | null;
  media_type: "image" | "video";
  media_url: string;
  placement: "banner" | "card" | "video" | "feed";
  lien_url: string | null;
};

export const listPublishedAds = createServerFn({ method: "GET" }).handler(async (): Promise<PublicAd[]> => {
  const url = process.env['SUPABASE_URL']!;
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const sb = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await sb
    .from("publicites")
    .select("id, titre, description, media_type, media_url, media_path, placement, lien_url")
    .eq("statut", "published")
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(24);
  if (error || !data?.length) return [];

  // Les visuels sont dans un espace privé : on signe des URLs courtes côté serveur.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const out: PublicAd[] = [];
  for (const row of data) {
    let mediaUrl = row.media_url;
    if (row.media_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("publicites")
        .createSignedUrl(row.media_path, 60 * 60);
      if (signed?.signedUrl) mediaUrl = signed.signedUrl;
    }
    out.push({
      id: row.id,
      titre: row.titre,
      description: row.description,
      media_type: row.media_type,
      media_url: mediaUrl,
      placement: row.placement,
      lien_url: row.lien_url,
    });
  }
  return out;
});
