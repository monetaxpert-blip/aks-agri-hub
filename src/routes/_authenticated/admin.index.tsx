import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStats } from "@/lib/admin.functions";
import { Users, Sprout, GraduationCap, Coins, FileText, CalendarClock, LogIn, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: AdminHome,
});

function AdminHome() {
  const fetch = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetch() });
  if (isLoading || !data) return <div>Chargement…</div>;
  const t = data.totals;

  const pie = [
    { name: "Agriculteurs", value: t.agriculteurs },
    { name: "Étudiants", value: t.etudiants },
    { name: "Investisseurs", value: t.investisseurs },
  ];
  const colors = ["#2E7D32", "#FBC02D", "#6D4C41"];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Vue d'ensemble</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Utilisateurs" value={t.users} />
        <Stat icon={Sprout} label="Agriculteurs" value={t.agriculteurs} />
        <Stat icon={GraduationCap} label="Étudiants" value={t.etudiants} />
        <Stat icon={Coins} label="Investisseurs" value={t.investisseurs} />
        <Stat icon={FileText} label="Annonces" value={t.annonces} sub={`${t.annoncesPending} en attente`} />
        <Stat icon={CalendarClock} label="Rendez-vous" value={t.rdv} sub={`${t.rdvPending} en attente`} />
        <Stat icon={LogIn} label="Connexions aujourd'hui" value={t.loginsToday} />
        <Stat icon={UserPlus} label="Nouveaux aujourd'hui" value={t.newToday} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-bold">Activité 14 derniers jours</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.series}>
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="users" name="Inscriptions" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="annonces" name="Annonces" fill="#FBC02D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-bold">Répartition des profils</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" outerRadius={90} label>
                  {pie.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-bold">Dernières actions</h3>
        <ul className="mt-3 divide-y divide-border text-sm">
          {data.recent.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span className="font-medium">{r.action}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
