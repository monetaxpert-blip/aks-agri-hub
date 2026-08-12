import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche | AgroKonnecte Sénégal" },
      { name: "description", content: "Le fonctionnement d'AKS : dépôt d'une demande, analyse par notre équipe, mise en relation sécurisée." },
      { property: "og:title", content: "Comment ça marche | AKS" },
      { property: "og:description", content: "Un fonctionnement simple, une garantie de confiance." },
    ],
  }),
  component: How,
});

const steps = [
  { n: 1, t: "Créez un compte", d: "Sélectionnez votre profil : Agriculteur, Étudiant ou Investisseur." },
  { n: 2, t: "Complétez votre profil", d: "Ajoutez vos informations pour permettre une mise en relation pertinente." },
  { n: 3, t: "Déposez une annonce", d: "Décrivez votre besoin, votre projet ou votre opportunité." },
  { n: 4, t: "Analyse par notre équipe", d: "Votre demande est visible uniquement par l'administrateur AKS." },
  { n: 5, t: "Identification des profils compatibles", d: "Nous sélectionnons les acteurs les plus pertinents." },
  { n: 6, t: "Mise en relation sécurisée", d: "Nous organisons la rencontre et planifions un rendez-vous si nécessaire." },
];

function How() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-extrabold md:text-5xl">Comment ça marche</h1>
      <p className="mt-4 text-muted-foreground">Un fonctionnement en 6 étapes. Toutes les interactions passent par notre équipe.</p>
      <div className="mt-10 space-y-4">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-aks font-display text-lg font-bold text-white shadow-premium">{s.n}</div>
            <div>
              <h3 className="font-display font-bold">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
