import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPartenaires } from "@/lib/public.functions";

export const Route = createFileRoute("/partenaires")({
  head: () => ({
    meta: [
      { title: "Partenaires — AgroKonnecte Sénégal" },
      { name: "description", content: "Découvrez les partenaires institutionnels et privés d'AgroKonnecte Sénégal." },
      { property: "og:title", content: "Nos partenaires — AKS" },
      { property: "og:description", content: "Institutions et acteurs qui soutiennent AKS." },
    ],
  }),
  component: Partners,
});

function Partners() {
  const { data = [] } = useQuery({ queryKey: ["partenaires"], queryFn: () => listPartenaires() });
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-extrabold md:text-5xl">Nos partenaires</h1>
      <p className="mt-4 text-muted-foreground">Des institutions et acteurs de l'écosystème agricole sénégalais qui soutiennent AKS.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {data.map((p) => (
          <a key={p.id} href={p.url ?? "#"} target={p.url ? "_blank" : undefined} rel="noreferrer" className="block rounded-2xl border border-border bg-card p-6 shadow-card transition hover:shadow-premium">
            {p.logo_url && <img src={p.logo_url} alt={p.nom} className="mb-3 h-12 object-contain" loading="lazy" />}
            <h3 className="font-display text-lg font-bold">{p.nom}</h3>
            {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
          </a>
        ))}
        {data.length === 0 && <p className="text-muted-foreground">Bientôt disponibles.</p>}
      </div>
    </div>
  );
}
