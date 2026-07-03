import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listAudit } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: Audit,
});

function Audit() {
  const fetch = useServerFn(listAudit);
  const { data } = useQuery({ queryKey: ["admin-audit"], queryFn: () => fetch({ data: { limit: 200 } }) });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Activité utilisateurs</h2>
        <ul className="mt-3 max-h-[70vh] divide-y divide-border overflow-auto text-sm">
          {(data?.activity ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">{a.action}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-xs text-muted-foreground">{(a as any).profiles?.prenom ?? ""} {(a as any).profiles?.nom ?? ""}</p>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Actions administrateur</h2>
        <ul className="mt-3 max-h-[70vh] divide-y divide-border overflow-auto text-sm">
          {(data?.admin ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">{a.action}</p>
                <p className="text-xs text-muted-foreground">{a.target_type ? `${a.target_type} · ${a.target_id}` : ""}</p>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
