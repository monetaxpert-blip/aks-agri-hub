import { createFileRoute } from "@tanstack/react-router";
import { AKS_ASSETS } from "@/lib/aks-assets";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — AgroKonnecte Sénégal" },
      { name: "description", content: "AgroKonnecte Sénégal est une plateforme professionnelle d'intermédiation agricole. Découvrez notre mission et notre approche." },
      { property: "og:title", content: "À propos — AgroKonnecte Sénégal" },
      { property: "og:description", content: "Notre mission, notre approche, notre équipe." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-extrabold md:text-5xl">À propos d'AgroKonnecte Sénégal</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Nous ne sommes ni un réseau social ni une marketplace. AKS est une plateforme professionnelle d'intermédiation qui met en relation agriculteurs, étudiants et investisseurs via une équipe humaine.
      </p>
      <img src={AKS_ASSETS.farmerTomatoes} alt="Agriculteur sénégalais" className="mt-8 w-full rounded-3xl shadow-premium" loading="lazy" />
      <div className="prose mt-8 max-w-none text-foreground">
        <h2 className="font-display text-2xl font-extrabold">Notre mission</h2>
        <p>Devenir le pont de confiance entre les acteurs de l'écosystème agricole sénégalais, en garantissant confidentialité, qualité, sécurité et accompagnement.</p>
        <h2 className="mt-8 font-display text-2xl font-extrabold">Notre philosophie</h2>
        <p>Chaque demande est étudiée. Les utilisateurs ne consultent jamais les profils des autres et ne communiquent jamais directement — c'est notre équipe qui organise chaque mise en relation.</p>
      </div>
    </div>
  );
}
