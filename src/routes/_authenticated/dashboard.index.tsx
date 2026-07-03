import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyDashboard } from "@/lib/user.functions";
import { FileText, CalendarClock, CheckCircle2, PlusCircle } from "lucide-react";
import { PremiumButton } from "@/components/aks/PremiumButton";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const fetch = useServerFn(getMyDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["my-dashboard"], queryFn: () => fetch() });

  if (isLoading) return <div>Chargement…</div>;
  const p = data?.profile;
  const s = data?.stats ?? { annonces: 0, annoncesValidees: 0, rdv: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Bonjour {p?.prenom ?? ""} 👋</h1>
          <p className="text-sm text-muted-foreground">Bienvenue sur votre espace AKS.</p>
        </div>
        <Link to="/dashboard/annonces/nouvelle"><PremiumButton><PlusCircle className="h-4 w-4" /> Déposer une annonce</PremiumButton></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileText} label="Mes annonces" value={s.annonces} />
        <StatCard icon={CheckCircle2} label="Annonces validées" value={s.annoncesValidees} />
        <StatCard icon={CalendarClock} label="Rendez-vous" value={s.rdv} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Mes dernières annonces</h2>
        <ul className="mt-3 divide-y divide-border">
          {(data?.annonces ?? []).slice(0, 5).map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{a.titre}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${a.statut === "validated" ? "bg-green-100 text-green-700" : a.statut === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{a.statut}</span>
            </li>
          ))}
          {(data?.annonces ?? []).length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Aucune annonce pour l'instant.</li>}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}
