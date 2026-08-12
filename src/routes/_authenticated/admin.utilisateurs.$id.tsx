import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getUserDetail } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs/$id")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/admin/login" });
  },
  component: UserDetail,
});

function UserDetail() {
  const { id } = Route.useParams();
  const fetch = useServerFn(getUserDetail);
  const { data, isLoading } = useQuery({ queryKey: ["user", id], queryFn: () => fetch({ data: { id } }) });
  if (isLoading || !data?.profile) return <div>Chargement…</div>;
  const p = data.profile;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-aks font-display text-2xl font-bold text-white">{(p.prenom?.[0] ?? "").toUpperCase()}{(p.nom?.[0] ?? "").toUpperCase()}</div>}
          <div>
            <h1 className="font-display text-2xl font-extrabold">{p.prenom} {p.nom}</h1>
            <p className="text-sm text-muted-foreground">{p.email} · {p.telephone}</p>
            <p className="mt-1 text-xs">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">{p.type_profil ?? "profil non défini"}</span>
              <span className="ml-2">{p.region ?? "-"} · {p.commune ?? "-"}</span>
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <Info label="Adresse" v={p.adresse ?? "-"} />
          <Info label="Statut" v={p.statut} />
          <Info label="Inscrit le" v={new Date(p.created_at).toLocaleDateString("fr-FR")} />
          <Info label="Dernière connexion" v={p.derniere_connexion ? new Date(p.derniere_connexion).toLocaleString("fr-FR") : "-"} />
          <Info label="Nombre de connexions" v={String(p.nb_connexions)} />
          <Info label="Dernière IP" v={p.last_ip ?? "-"} />
          <Info label="Navigateur" v={p.last_user_agent ?? "-"} />
        </dl>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display font-bold">Annonces ({data.annonces.length})</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {data.annonces.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <span>{a.titre}</span>
              <span className="text-xs text-muted-foreground">{a.statut} · {new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display font-bold">Rendez-vous ({data.rendezVous.length})</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {data.rendezVous.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span>{r.objet}</span>
              <span className="text-xs text-muted-foreground">{r.date_souhaitee} · {r.statut}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display font-bold">Historique d'activité</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {data.activity.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <span className="font-medium">{a.action}</span>
              <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</span>
            </li>
          ))}
          {data.activity.length === 0 && <li className="py-4 text-center text-muted-foreground">Aucune activité.</li>}
        </ul>
      </section>
    </div>
  );
}

function Info({ label, v }: { label: string; v: string }) {
  return (<div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-medium">{v}</dd></div>);
}
