import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listAllAnnonces, moderateAnnonce } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Archive } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/annonces")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: Ann,
});

function Ann() {
  const [statut, setStatut] = useState("");
  const list = useServerFn(listAllAnnonces);
  const mod = useServerFn(moderateAnnonce);
  const q = useQuery({ queryKey: ["admin-annonces", statut], queryFn: () => list({ data: { statut } }) });

  async function action(id: string, next: "validated" | "rejected" | "archived") {
    const note = next === "rejected" ? prompt("Raison du refus (facultatif) :") ?? undefined : undefined;
    await mod({ data: { id, statut: next, note } });
    toast.success(`Annonce ${next}`);
    q.refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">Annonces</h1>
        <Select value={statut || "all"} onValueChange={(v) => setStatut(v === "all" ? "" : v)}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="validated">Validées</SelectItem>
            <SelectItem value="rejected">Refusées</SelectItem>
            <SelectItem value="archived">Archivées</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4">
        {(q.data ?? []).map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold">{a.titre}</h3>
                <p className="text-xs text-muted-foreground">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  Par {(a as any).profiles?.prenom} {(a as any).profiles?.nom} · {new Date(a.created_at).toLocaleDateString("fr-FR")} · {a.categorie ?? "-"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{a.description}</p>
                {a.admin_notes && <p className="mt-2 rounded bg-yellow-50 p-2 text-xs">Note admin : {a.admin_notes}</p>}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${a.statut === "validated" ? "bg-green-100 text-green-700" : a.statut === "rejected" ? "bg-red-100 text-red-700" : a.statut === "archived" ? "bg-gray-200 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>{a.statut}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => action(a.id, "validated")} className="gap-1"><CheckCircle className="h-4 w-4 text-green-600" /> Valider</Button>
              <Button size="sm" variant="outline" onClick={() => action(a.id, "rejected")} className="gap-1"><XCircle className="h-4 w-4 text-red-600" /> Refuser</Button>
              <Button size="sm" variant="outline" onClick={() => action(a.id, "archived")} className="gap-1"><Archive className="h-4 w-4" /> Archiver</Button>
            </div>
          </div>
        ))}
        {q.data?.length === 0 && <p className="text-center text-muted-foreground">Aucune annonce.</p>}
      </div>
    </div>
  );
}
