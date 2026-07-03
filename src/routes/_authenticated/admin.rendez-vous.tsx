import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listAllRendezVous, updateRendezVous } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/rendez-vous")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: Rdv,
});

function Rdv() {
  const list = useServerFn(listAllRendezVous);
  const upd = useServerFn(updateRendezVous);
  const q = useQuery({ queryKey: ["admin-rdv"], queryFn: () => list() });

  async function setStatus(id: string, statut: "pending" | "planifie" | "termine" | "annule") {
    await upd({ data: { id, statut } });
    toast.success("Mis à jour");
    q.refetch();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Rendez-vous</h1>
      <div className="grid gap-3">
        {(q.data ?? []).map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold">{r.objet}</h3>
                <p className="text-xs text-muted-foreground">{r.nom} · {r.email} · {r.telephone}</p>
                <p className="mt-1 text-sm">{new Date(r.date_souhaitee).toLocaleDateString("fr-FR")} à {r.heure_souhaitee} · <em>{r.mode}</em>{r.lieu ? ` · ${r.lieu}` : ""}</p>
                {r.description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.description}</p>}
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{r.statut}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "planifie")}>Planifier</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "termine")}>Terminé</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "annule")}>Annuler</Button>
            </div>
          </div>
        ))}
        {q.data?.length === 0 && <p className="text-center text-muted-foreground">Aucun rendez-vous.</p>}
      </div>
    </div>
  );
}
