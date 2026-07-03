import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/lib/user.functions";
import { profileUpdateSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PremiumButton } from "@/components/aks/PremiumButton";

export const Route = createFileRoute("/_authenticated/dashboard/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  const [p, setP] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const save = useServerFn(updateProfile);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
      if (prof) setP({
        prenom: prof.prenom ?? "", nom: prof.nom ?? "", telephone: prof.telephone ?? "",
        region: prof.region ?? "", commune: prof.commune ?? "", adresse: prof.adresse ?? "",
        bio: prof.bio ?? "", avatar_url: prof.avatar_url ?? "",
      });
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = profileUpdateSchema.safeParse(p);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
    setLoading(true);
    try {
      await save({ data: parsed.data });
      toast.success("Profil mis à jour");
    } catch (err) { toast.error((err as Error).message); }
    finally { setLoading(false); }
  }

  const field = (k: string) => (v: string) => setP((x) => ({ ...x, [k]: v }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold">Mon profil</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Prénom</Label><Input value={p.prenom ?? ""} onChange={(e) => field("prenom")(e.target.value)} /></div>
          <div><Label>Nom</Label><Input value={p.nom ?? ""} onChange={(e) => field("nom")(e.target.value)} /></div>
          <div><Label>Téléphone</Label><Input value={p.telephone ?? ""} onChange={(e) => field("telephone")(e.target.value)} /></div>
          <div><Label>Région</Label><Input value={p.region ?? ""} onChange={(e) => field("region")(e.target.value)} /></div>
          <div><Label>Commune</Label><Input value={p.commune ?? ""} onChange={(e) => field("commune")(e.target.value)} /></div>
          <div><Label>Adresse</Label><Input value={p.adresse ?? ""} onChange={(e) => field("adresse")(e.target.value)} /></div>
        </div>
        <div><Label>Bio</Label><Textarea rows={4} value={p.bio ?? ""} onChange={(e) => field("bio")(e.target.value)} /></div>
        <PremiumButton type="submit" loading={loading}>Enregistrer</PremiumButton>
      </form>
    </div>
  );
}
