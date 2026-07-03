import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/rendez-vous")({
  component: MesRdv,
});

interface R { id: string; objet: string; date_souhaitee: string; heure_souhaitee: string; mode: string; statut: string; lieu: string | null; }

function MesRdv() {
  const [rows, setRows] = useState<R[]>([]);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("rendez_vous").select("id, objet, date_souhaitee, heure_souhaitee, mode, statut, lieu").eq("user_id", u.user.id).order("created_at", { ascending: false });
      setRows((data as R[]) ?? []);
    })();
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Mes rendez-vous</h1>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary/60 text-left"><tr><th className="px-4 py-3">Objet</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Heure</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Statut</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">{r.objet}</td>
                <td className="px-4 py-3">{new Date(r.date_souhaitee).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3">{r.heure_souhaitee}</td>
                <td className="px-4 py-3">{r.mode}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold">{r.statut}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun rendez-vous.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
