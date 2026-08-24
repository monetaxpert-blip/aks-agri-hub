import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sprout, Users, Handshake, ShieldCheck, Target, ArrowRight } from "lucide-react";
import { AKS_ASSETS } from "@/lib/aks-assets";
import { PremiumButton } from "@/components/aks/PremiumButton";

export const Route = createFileRoute("/notre-histoire")({
  head: () => ({
    meta: [
      { title: "Notre Histoire | Agro Konnecte Sénégal" },
      {
        name: "description",
        content:
          "Découvrez l'histoire d'Agro Konnecte Sénégal : d'un constat de terrain à un carrefour digital qui connecte agriculteurs, étudiants, investisseurs et cadres.",
      },
      { property: "og:title", content: "Notre Histoire | Agro Konnecte Sénégal" },
      {
        property: "og:description",
        content:
          "De l'idée née dans les champs sénégalais à la plateforme d'intermédiation agricole de référence.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.senaks.company/notre-histoire" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.senaks.company/notre-histoire" }],
  }),
  component: NotreHistoire,
});

const etapes = [
  {
    icon: Sprout,
    titre: "Un constat de terrain",
    texte:
      "Partout au Sénégal, des femmes et des hommes cultivent la terre avec passion. Pourtant, faute d'un espace commun fiable, leurs projets restent souvent invisibles, isolés et sans financement.",
  },
  {
    icon: Users,
    titre: "Une conviction partagée",
    texte:
      "Les compétences existent : agriculteurs expérimentés, étudiants formés, cadres du secteur et investisseurs prêts à s'engager. Il manquait simplement un point de rencontre digne de confiance.",
  },
  {
    icon: Handshake,
    titre: "La naissance d'Agro Konnecte Sénégal",
    texte:
      "AKS est né de cette volonté : créer un carrefour digital où chaque projet agricole peut être présenté, vérifié, accompagné et connecté aux bonnes personnes.",
  },
  {
    icon: ShieldCheck,
    titre: "Une intermédiation sécurisée",
    texte:
      "Chaque annonce est examinée par notre équipe avant publication. Les échanges passent par AKS afin de garantir sérieux, confidentialité et protection de tous les profils.",
  },
  {
    icon: Target,
    titre: "Notre ambition",
    texte:
      "Faire d'Agro Konnecte Sénégal la référence de l'intermédiation agricole au Sénégal, puis en Afrique de l'Ouest, en cultivant ensemble l'avenir.",
  },
];

function NotreHistoire() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60 bg-secondary/40">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${AKS_ASSETS.leafyBg})` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <img src={AKS_ASSETS.logo} alt="Logo Agro Konnecte Sénégal" className="mx-auto h-24 w-auto md:h-32" />
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight md:text-5xl">Notre Histoire</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              L'histoire d'Agro Konnecte Sénégal est née d'un besoin concret : rapprocher celles et ceux qui font
              l'agriculture sénégalaise de celles et ceux qui veulent y investir, y apprendre et y innover.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            src={AKS_ASSETS.farmers}
            alt="Agriculteurs sénégalais travaillant la terre"
            className="h-72 w-full rounded-3xl object-cover shadow-lg md:h-96"
            loading="lazy"
          />
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-extrabold">Tout commence dans les champs</h2>
            <p className="text-muted-foreground">
              Dans les régions de Thiès, Kaolack, Saint-Louis ou Ziguinchor, des producteurs mènent chaque jour un
              travail essentiel. Beaucoup manquent pourtant de visibilité, de partenaires fiables et de financement
              pour franchir un nouveau palier.
            </p>
            <p className="text-muted-foreground">
              De l'autre côté, des étudiants cherchent un terrain d'apprentissage, des cadres veulent transmettre leur
              expertise et des investisseurs recherchent des projets sérieux et lisibles. Agro Konnecte Sénégal existe
              pour réunir ces énergies au même endroit.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="text-center font-display text-3xl font-extrabold md:text-4xl">Les étapes de notre parcours</h2>
          <div className="mt-10 space-y-4">
            {etapes.map((e, i) => (
              <motion.article
                key={e.titre}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <e.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{e.titre}</h3>
                  <p className="mt-1 text-sm text-muted-foreground md:text-base">{e.texte}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="order-2 space-y-4 md:order-1">
            <h2 className="font-display text-3xl font-extrabold">Cultiver l'avenir, ensemble</h2>
            <p className="text-muted-foreground">
              Aujourd'hui, AKS accompagne des projets de production, de transformation et de commercialisation. Notre
              équipe vérifie chaque profil, encadre chaque mise en relation et veille à la qualité des échanges.
            </p>
            <p className="text-muted-foreground">
              Rejoindre Agro Konnecte Sénégal, c'est participer à une agriculture connectée, durable et porteuse
              d'opportunités pour toute une génération.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/auth/register">
                <PremiumButton>
                  Rejoindre AKS <ArrowRight className="h-4 w-4" />
                </PremiumButton>
              </Link>
              <Link
                to="/a-propos"
                className="inline-flex items-center rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary"
              >
                En savoir plus
              </Link>
            </div>
          </div>
          <motion.img
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            src={AKS_ASSETS.farmerTomatoes}
            alt="Producteur sénégalais présentant sa récolte de tomates"
            className="order-1 h-72 w-full rounded-3xl object-cover shadow-lg md:order-2 md:h-96"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
}
