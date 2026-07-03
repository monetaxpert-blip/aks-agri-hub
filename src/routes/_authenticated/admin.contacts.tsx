import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listContacts } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/contacts")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: Contacts,
});

function Contacts() {
  const list = useServerFn(listContacts);
  const { data = [] } = useQuery({ queryKey: ["admin-contacts"], queryFn: () => list() });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Messages de contact</h1>
      <div className="grid gap-3">
        {data.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">{c.sujet}</h3>
              <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("fr-FR")}</span>
            </div>
            <p className="text-xs text-muted-foreground">{c.nom} · {c.email}{c.telephone ? ` · ${c.telephone}` : ""}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.message}</p>
          </div>
        ))}
        {data.length === 0 && <p className="text-center text-muted-foreground">Aucun message.</p>}
      </div>
    </div>
  );
}
