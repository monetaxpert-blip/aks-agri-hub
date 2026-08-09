import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { listAllPublicites, moderatePublicite, deletePubliciteAdmin } from "@/lib/ads-admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/publicites")({
  head: () => ({
    meta: [
      { title: "Modération des publicités — Admin AKS" },
      { name: "description", content: "Gestion et modération des campagnes publicitaires AgroKonnecte Sénégal." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Modération des publicités — Admin AKS" },
      { property: "og:description", content: "Administration AgroKonnecte Sénégal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPublicites,
});

const STATUTS = [
  { v: "pending", l: "En attente" },
  { v: "approved", l: "Approuvée" },
  { v: "published", l: "Publiée" },
  { v: "rejected", l: "Refusée" },
  { v: "suspended", l: "Suspendue" },
  { v: "expired", l: "Expirée" },
] as const;

function AdminPublicites() {
  const qc = useQueryClient();
  const [filtre, setFiltre] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-publicites", filtre],
    queryFn: () => listAllPublicites({ data: { statut: filtre } }),
  });

  const moderate = useMutation({
    mutationFn: (v: { id: string; statut: (typeof STATUTS)[number]["v"]; note?: string; date_debut?: string; date_fin?: string }) =>
      moderatePublicite({ data: v }),
    onSuccess: () => {
      toast.success("Campagne mise à jour");
      qc.invalidateQueries({ queryKey: ["admin-publicites"] });
      qc.invalidateQueries({ queryKey: ["published-ads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePubliciteAdmin({ data: { id } }),
    onSuccess: () => {
      toast.success("Campagne supprimée");
      qc.invalidateQueries({ queryKey: ["admin-publicites"] });
      qc.invalidateQueries({ queryKey: ["published-ads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Publicités</h1>
          <p className="text-sm text-muted-foreground">Approuver, publier, suspendre ou refuser les campagnes.</p>
        </div>
        <div className="w-48">
          <Label className="text-xs">Statut</Label>
          <Select value={filtre || "all"} onValueChange={(v) => setFiltre(v === "all" ? "" : v)}>
            <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {STATUTS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {!isLoading && !data?.length && <p className="text-sm text-muted-foreground">Aucune campagne.</p>}

      <div className="space-y-3">
        {data?.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-bold">{p.titre}</p>
                <p className="text-xs text-muted-foreground">
                  {p.annonceur?.entreprise ?? "Annonceur"} · {p.annonceur?.email ?? "—"} · {p.annonceur?.telephone ?? "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.media_type === "video" ? "Vidéo" : "Image"} · {p.placement} · souhaité :{" "}
                  {p.periode_souhaitee_debut ?? "—"} → {p.periode_souhaitee_fin ?? "—"}
                </p>
                {p.description && <p className="mt-2 max-w-2xl text-sm">{p.description}</p>}
                {p.lien_url && (
                  <a href={p.lien_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    {p.lien_url}
                  </a>
                )}
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                {STATUTS.find((s) => s.v === p.statut)?.l ?? p.statut}
              </span>
            </div>

            <form
              className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                moderate.mutate({
                  id: p.id,
                  statut: String(fd.get("statut")) as (typeof STATUTS)[number]["v"],
                  note: String(fd.get("note") ?? ""),
                  date_debut: String(fd.get("date_debut") ?? ""),
                  date_fin: String(fd.get("date_fin") ?? ""),
                });
              }}
            >
              <div>
                <Label className="text-xs">Nouveau statut</Label>
                <select name="statut" defaultValue={p.statut} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm">
                  {STATUTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Début diffusion</Label>
                <Input name="date_debut" type="date" defaultValue={p.date_debut?.slice(0, 10) ?? ""} className="h-10 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Fin diffusion</Label>
                <Input name="date_fin" type="date" defaultValue={p.date_fin?.slice(0, 10) ?? ""} className="h-10 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Note interne</Label>
                <Input name="note" defaultValue={p.admin_notes ?? ""} className="h-10 rounded-xl" />
              </div>
              <div className="flex gap-2 md:col-span-4">
                <Button type="submit" size="sm" disabled={moderate.isPending}>Enregistrer</Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-destructive"
                  onClick={() => remove.mutate(p.id)}
                  disabled={remove.isPending}
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
