import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Sprout, GraduationCap, Coins, ShieldCheck, Handshake, Sparkles } from "lucide-react";
import { AKS_ASSETS } from "@/lib/aks-assets";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { listPartenaires } from "@/lib/public.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroKonnecte Sénégal — Connecter l'agriculture au futur" },
      { name: "description", content: "Plateforme d'intermédiation agricole au Sénégal. Nous connectons agriculteurs, étudiants et investisseurs via des mises en relation étudiées et sécurisées par notre équipe." },
      { property: "og:title", content: "AgroKonnecte Sénégal" },
      { property: "og:description", content: "Connecter, investir, innover, cultiver l'avenir." },
    ],
  }),
  component: Home,
});

const profils = [
  { icon: Sprout, title: "Agriculteurs", desc: "Trouvez investisseurs, acheteurs et partenariats pour développer votre exploitation." },
  { icon: GraduationCap, title: "Étudiants", desc: "Décrochez un stage, un projet ou collaborez avec une exploitation." },
  { icon: Coins, title: "Investisseurs", desc: "Financez et accompagnez des projets agricoles sélectionnés au Sénégal." },
];

const etapes = [
  { n: 1, t: "Créez votre compte", d: "Choisissez votre profil et complétez vos informations." },
  { n: 2, t: "Déposez votre demande", d: "Soumettez votre annonce, projet ou opportunité." },
  { n: 3, t: "Notre équipe analyse", d: "Nous étudions votre demande et identifions les profils compatibles." },
  { n: 4, t: "Mise en relation sécurisée", d: "Nous organisons la rencontre et vous accompagnons." },
];

function Home() {
  const partenaires = useQuery({ queryKey: ["partenaires"], queryFn: () => listPartenaires() });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aks opacity-95" />
        <img src={AKS_ASSETS.farmers} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="eager" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Plateforme officielle
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Connecter l'agriculture sénégalaise au futur.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/90">
              AgroKonnecte Sénégal est une plateforme d'intermédiation qui met en relation agriculteurs, étudiants et investisseurs — de manière sécurisée, humaine et personnalisée.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth/register"><PremiumButton size="lg">Commencer</PremiumButton></Link>
              <Link to="/comment-ca-marche" className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Comment ça marche <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative hidden md:block">
            <div className="glass-card overflow-hidden rounded-3xl shadow-premium">
              <img src={AKS_ASSETS.farmerTomatoes} alt="Agriculteur sénégalais" className="h-[440px] w-full object-cover" loading="eager" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROFILS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Trois profils, un écosystème.</h2>
          <p className="mt-3 text-muted-foreground">La plateforme ne connecte jamais les utilisateurs directement — chaque demande est étudiée par notre équipe.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {profils.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-3xl border border-border bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-premium">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-aks text-white shadow-premium">
                <p.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">Comment ça marche</h2>
              <p className="mt-3 max-w-lg text-muted-foreground">Un fonctionnement simple, une garantie de confiance à chaque étape.</p>
              <div className="mt-8 space-y-5">
                {etapes.map((e) => (
                  <div key={e.n} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-aks font-display font-bold text-white shadow-premium">{e.n}</div>
                    <div>
                      <h4 className="font-display font-bold">{e.t}</h4>
                      <p className="text-sm text-muted-foreground">{e.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src={AKS_ASSETS.farmers} alt="Agriculteurs au travail" className="rounded-3xl shadow-premium" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Confidentialité totale", d: "Vos données ne sont jamais partagées avec d'autres utilisateurs." },
            { icon: Handshake, t: "Mise en relation étudiée", d: "Notre équipe identifie les profils réellement compatibles." },
            { icon: Sparkles, t: "Accompagnement humain", d: "Nous vous suivons du dépôt à la rencontre." },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl border border-border p-8">
              <f.icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="font-display font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-aks p-10 text-center shadow-premium md:p-16">
          <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl">Prêt à rejoindre l'écosystème ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">Créez votre compte et déposez votre première demande en quelques minutes.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/auth/register">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-primary shadow-premium transition hover:scale-105 font-display">
                Créer un compte <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/rendez-vous" className="inline-flex items-center gap-2 rounded-2xl border border-white/50 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 font-display">
              Prendre un rendez-vous
            </Link>
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      {(partenaires.data ?? []).length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
          <h3 className="text-center font-display text-xl font-bold text-muted-foreground">Nos partenaires</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {partenaires.data!.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border p-6 text-center">
                <p className="font-display font-bold">{p.nom}</p>
                {p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
