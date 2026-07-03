import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listUsers, exportUsersCSV, setUserStatus, deleteUser } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, PauseCircle, PlayCircle, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: Users,
});

function Users() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [statut, setStatut] = useState("");

  const list = useServerFn(listUsers);
  const csv = useServerFn(exportUsersCSV);
  const setStatusFn = useServerFn(setUserStatus);
  const del = useServerFn(deleteUser);

  const q = useQuery({
    queryKey: ["admin-users", search, type, region, statut],
    queryFn: () => list({ data: { search, type_profil: type, region, statut } }),
  });

  async function download() {
    try {
      const res = await csv({ data: { type_profil: type, region, statut, from: "", to: "" } });
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `aks-utilisateurs-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`${res.count} utilisateurs exportés`);
    } catch (err) { toast.error((err as Error).message); }
  }

  async function toggle(id: string, current: string) {
    const next = current === "active" ? "suspended" : "active";
    await setStatusFn({ data: { id, statut: next } });
    toast.success(next === "suspended" ? "Compte suspendu" : "Compte réactivé");
    q.refetch();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cet utilisateur ?")) return;
    await del({ data: { id } });
    toast.success("Supprimé");
    q.refetch();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Utilisateurs</h1>
        <Button onClick={download} className="gap-2 bg-gradient-aks text-white"><Download className="h-4 w-4" /> Exporter CSV</Button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={type || "all"} onValueChange={(v) => setType(v === "all" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Profil" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les profils</SelectItem>
            <SelectItem value="agriculteur">Agriculteurs</SelectItem>
            <SelectItem value="etudiant">Étudiants</SelectItem>
            <SelectItem value="investisseur">Investisseurs</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Région" value={region} onChange={(e) => setRegion(e.target.value)} />
        <Select value={statut || "all"} onValueChange={(v) => setStatut(v === "all" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary/60 text-left"><tr>
            <th className="px-4 py-3">Nom</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Téléphone</th>
            <th className="px-4 py-3">Profil</th><th className="px-4 py-3">Région</th>
            <th className="px-4 py-3">Inscrit</th><th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Annonces</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {(q.data ?? []).map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{u.prenom} {u.nom}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.telephone}</td>
                <td className="px-4 py-3">{u.type_profil ?? "—"}</td>
                <td className="px-4 py-3">{u.region ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${u.statut === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.statut}</span></td>
                <td className="px-4 py-3">{u.nb_annonces}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link to="/admin/utilisateurs/$id" params={{ id: u.id }}><Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button></Link>
                    <Button size="sm" variant="ghost" onClick={() => toggle(u.id, u.statut)}>
                      {u.statut === "active" ? <PauseCircle className="h-4 w-4 text-yellow-600" /> : <PlayCircle className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {q.data?.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Aucun utilisateur.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
