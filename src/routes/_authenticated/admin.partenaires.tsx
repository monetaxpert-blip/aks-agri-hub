import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listAllPartenaires, upsertPartenaire, deletePartenaire } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/partenaires")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: Part,
});

function Part() {
  const list = useServerFn(listAllPartenaires);
  const upsert = useServerFn(upsertPartenaire);
  const del = useServerFn(deletePartenaire);
  const q = useQuery({ queryKey: ["admin-part"], queryFn: () => list() });
  const [f, setF] = useState({ nom: "", url: "", description: "" });

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!f.nom) return;
    await upsert({ data: { nom: f.nom, url: f.url, description: f.description, ordre: 99, actif: true } });
    toast.success("Ajouté");
    setF({ nom: "", url: "", description: "" });
    q.refetch();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ?")) return;
    await del({ data: { id } });
    q.refetch();
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Partenaires</h1>
      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <div><Label>Nom</Label><Input value={f.nom} onChange={(e) => setF((x) => ({ ...x, nom: e.target.value }))} required /></div>
        <div><Label>URL</Label><Input value={f.url} onChange={(e) => setF((x) => ({ ...x, url: e.target.value }))} /></div>
        <div className="md:col-span-2"><Label>Description</Label><Textarea rows={1} value={f.description} onChange={(e) => setF((x) => ({ ...x, description: e.target.value }))} /></div>
        <div className="md:col-span-4"><PremiumButton type="submit" arrow={false}>Ajouter</PremiumButton></div>
      </form>
      <div className="grid gap-3">
        {(q.data ?? []).map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div>
              <h3 className="font-display font-bold">{p.nom}</h3>
              {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
