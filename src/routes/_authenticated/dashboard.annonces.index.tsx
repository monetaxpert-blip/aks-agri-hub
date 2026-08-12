import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAnnonce } from "@/lib/user.functions";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/annonces/")({
  component: MesAnnonces,
});

interface A { id: string; titre: string; statut: string; created_at: string; categorie: string | null; }

function MesAnnonces() {
  const [rows, setRows] = useState<A[]>([]);
  const del = useServerFn(deleteMyAnnonce);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("annonces").select("id, titre, statut, created_at, categorie").eq("user_id", u.user.id).order("created_at", { ascending: false });
    setRows((data as A[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    await del({ data: { id } });
    toast.success("Supprimée");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Mes annonces</h1>
        <Link to="/dashboard/annonces/nouvelle"><PremiumButton><PlusCircle className="h-4 w-4" /> Nouvelle annonce</PremiumButton></Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary/60 text-left"><tr>
            <th className="px-4 py-3">Titre</th><th className="px-4 py-3">Catégorie</th>
            <th className="px-4 py-3">Statut</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{a.titre}</td>
                <td className="px-4 py-3">{a.categorie ?? "-"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${a.statut === "validated" ? "bg-green-100 text-green-700" : a.statut === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{a.statut}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucune annonce.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
