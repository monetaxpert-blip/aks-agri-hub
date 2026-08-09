import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { getMyAnnonceurSpace, deleteMyPublicite } from "@/lib/ads.functions";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/publicites/")({
  head: () => ({
    meta: [
      { title: "Mes publicités — AgroKonnecte Sénégal" },
      { name: "description", content: "Gérez vos campagnes publicitaires sur AgroKonnecte Sénégal." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Mes publicités — AgroKonnecte Sénégal" },
      { property: "og:description", content: "Espace annonceur AgroKonnecte Sénégal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MesPublicites,
});

const STATUT_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  approved: { label: "Approuvée", cls: "bg-sky-100 text-sky-800" },
  published: { label: "Publiée", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Refusée", cls: "bg-red-100 text-red-800" },
  expired: { label: "Expirée", cls: "bg-muted text-muted-foreground" },
  suspended: { label: "Suspendue", cls: "bg-orange-100 text-orange-800" },
};

function MesPublicites() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["annonceur-space"], queryFn: () => getMyAnnonceurSpace() });

  const del = useMutation({
    mutationFn: (id: string) => deleteMyPublicite({ data: { id } }),
    onSuccess: () => {
      toast.success("Campagne supprimée");
      qc.invalidateQueries({ queryKey: ["annonceur-space"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Mes publicités</h1>
          <p className="text-sm text-muted-foreground">
            Chaque campagne est vérifiée par l'équipe AKS avant diffusion.
          </p>
        </div>
        <Link to="/dashboard/publicites/nouvelle">
          <PremiumButton className="gap-2"><Plus className="h-4 w-4" /> Nouvelle campagne</PremiumButton>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { k: "total", l: "Total" },
          { k: "pending", l: "En attente" },
          { k: "published", l: "Publiées" },
          { k: "rejected", l: "Refusées" },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            <p className="font-display text-2xl font-extrabold">
              {(data?.stats as Record<string, number> | undefined)?.[s.k] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && !data?.publicites.length && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Megaphone className="h-8 w-8 text-primary" />
            <p className="font-semibold">Aucune campagne pour le moment</p>
            <p className="text-sm text-muted-foreground">Créez votre première publicité, l'équipe AKS la validera.</p>
          </div>
        )}
        {data?.publicites.map((p) => {
          const s = STATUT_LABEL[p.statut] ?? STATUT_LABEL['pending']!;
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-3 border-b border-border p-4 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.titre}</p>
                <p className="text-xs text-muted-foreground">
                  {p.media_type === "video" ? "Vidéo" : "Image"} · emplacement {p.placement} ·{" "}
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </p>
                {p.admin_notes && <p className="mt-1 text-xs text-destructive">Note AKS : {p.admin_notes}</p>}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-destructive"
                onClick={() => del.mutate(p.id)}
                disabled={del.isPending}
              >
                <Trash2 className="h-4 w-4" /> Supprimer
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
