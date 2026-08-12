import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMyAnnonceurSpace, saveAnnonceurDetails } from "@/lib/ads.functions";
import { annonceurDetailsSchema } from "@/lib/schemas";
import type { z } from "zod";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/dashboard/annonceur")({
  head: () => ({
    meta: [
      { title: "Ma fiche annonceur | AgroKonnecte Sénégal" },
      { name: "description", content: "Renseignez les informations de votre entreprise annonceur." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Ma fiche annonceur | AgroKonnecte Sénégal" },
      { property: "og:description", content: "Espace annonceur AgroKonnecte Sénégal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FicheAnnonceur,
});

function FicheAnnonceur() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["annonceur-space"], queryFn: () => getMyAnnonceurSpace() });
  const d = data?.details;

  const save = useMutation({
    mutationFn: (v: z.infer<typeof annonceurDetailsSchema>) => saveAnnonceurDetails({ data: v }),
    onSuccess: () => {
      toast.success("Fiche enregistrée");
      qc.invalidateQueries({ queryKey: ["annonceur-space"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">Ma fiche annonceur</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ces informations aident l'équipe AKS à valider vos campagnes.</p>

      <form
        key={d?.user_id ?? "new"}
        className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const parsed = annonceurDetailsSchema.safeParse({
            entreprise: String(fd.get("entreprise") ?? ""),
            responsable: String(fd.get("responsable") ?? ""),
            email: String(fd.get("email") ?? ""),
            telephone: String(fd.get("telephone") ?? ""),
            secteur_activite: String(fd.get("secteur_activite") ?? ""),
            localisation: String(fd.get("localisation") ?? ""),
            description: String(fd.get("description") ?? ""),
            logo_url: String(fd.get("logo_url") ?? ""),
            site_web: String(fd.get("site_web") ?? ""),
            infos_complementaires: String(fd.get("infos_complementaires") ?? ""),
          });
          if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
          save.mutate(parsed.data);
        }}
      >
        <div><Label>Entreprise / marque</Label><Input name="entreprise" required defaultValue={d?.entreprise ?? ""} className="h-11 rounded-xl" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Responsable</Label><Input name="responsable" defaultValue={d?.responsable ?? ""} className="h-11 rounded-xl" /></div>
          <div><Label>Secteur d'activité</Label><Input name="secteur_activite" defaultValue={d?.secteur_activite ?? ""} className="h-11 rounded-xl" /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Email professionnel</Label><Input name="email" type="email" defaultValue={d?.email ?? ""} className="h-11 rounded-xl" /></div>
          <div><Label>Téléphone</Label><Input name="telephone" defaultValue={d?.telephone ?? ""} className="h-11 rounded-xl" /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Localisation</Label><Input name="localisation" defaultValue={d?.localisation ?? ""} className="h-11 rounded-xl" /></div>
          <div><Label>Site web (https://)</Label><Input name="site_web" defaultValue={d?.site_web ?? ""} placeholder="https://…" className="h-11 rounded-xl" /></div>
        </div>
        <div><Label>Logo (URL)</Label><Input name="logo_url" defaultValue={d?.logo_url ?? ""} className="h-11 rounded-xl" /></div>
        <div><Label>Présentation</Label><Textarea name="description" rows={4} defaultValue={d?.description ?? ""} className="rounded-xl" /></div>
        <div><Label>Informations complémentaires</Label><Textarea name="infos_complementaires" rows={3} defaultValue={d?.infos_complementaires ?? ""} className="rounded-xl" /></div>
        <PremiumButton type="submit" fullWidth loading={save.isPending}>Enregistrer ma fiche</PremiumButton>
      </form>
    </div>
  );
}
