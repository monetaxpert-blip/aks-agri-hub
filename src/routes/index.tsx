import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Sprout, GraduationCap, Coins, Briefcase, ShieldCheck, Handshake, Sparkles, Leaf, Users, HeartHandshake } from "lucide-react";
import { AKS_ASSETS } from "@/lib/aks-assets";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { listPartenaires } from "@/lib/public.functions";
import { AdSlot } from "@/components/aks/AdSlot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroKonnecte Sénégal, Carrefour digital de l'agriculture" },
      { name: "description", content: "AgroKonnecte Sénégal est l'espace digital dédié au secteur agricole. Nous connectons agriculteurs, étudiants, investisseurs et cadres de manière sécurisée, simple et efficace pour faciliter le développement de projets à fort impact." },
      { property: "og:title", content: "AgroKonnecte Sénégal Carrefour digital de l'agriculture" },
      { property: "og:description", content: "Agriculteurs • Étudiants • Investisseurs • Cadres bienvenue dans votre carrefour digital agricole." },
    ],
  }),
  component: Home,
});

const profils = [
  { icon: Sprout, title: "Agriculteurs", desc: "Trouvez investisseurs, acheteurs et partenariats pour développer votre exploitation." },
  { icon: GraduationCap, title: "Étudiants", desc: "Décrochez un stage, un projet ou collaborez avec une exploitation." },
  { icon: Coins, title: "Investisseurs", desc: "Financez et accompagnez des projets agricoles sélectionnés au Sénégal." },
  { icon: Briefcase, title: "Cadres", desc: "Mettez votre expertise au service de projets agricoles à fort impact." },
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
        <img src={AKS_ASSETS.farmers} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" loading="eager" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="flex justify-center">
            <img
              src={AKS_ASSETS.logo}
              alt="AgroKonnecte Sénégal"
              className="h-48 w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:h-64 lg:h-72"
              loading="eager"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Plateforme officielle
            </span>
            <h1 className="mx-auto mt-5 max-w-4xl font-display text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
              <span className="block text-white/95">Agriculteurs • Étudiants • Investisseurs</span>
              <span className="mt-2 block text-white">Bienvenue dans votre carrefour digital</span>
              <span className="mt-2 block bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">
                Agro Konnect Sénégal
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base text-white/90 md:text-lg">
              Agro Konnecte Sénégal est l'espace digital dédié au secteur agricole. Nous connectons les acteurs du monde agricole de manière sécurisée, simple et efficace afin de faciliter le développement de projets à fort impact.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/auth/register"><PremiumButton size="lg">Commencer</PremiumButton></Link>
              <Link to="/comment-ca-marche" className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Comment ça marche <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PUBLICITÉ | BANNIÈRE */}
      <AdSlot placement="banner" title="Espace annonceurs" limit={1} />

      {/* NOTRE HISTOIRE */}
      <section className="relative overflow-hidden bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <Leaf className="h-3.5 w-3.5" /> Notre histoire
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">Une idée née d'un constat, une plateforme née d'une vision.</h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-4 text-muted-foreground">
              <p>
                Au Sénégal, l'agriculture est le cœur battant de nombreuses familles, communautés et régions.
                Pourtant, agriculteurs, étudiants, investisseurs et cadres évoluent trop souvent dans des mondes séparés,
                sans espace commun pour se rencontrer, échanger et bâtir ensemble.
              </p>
              <p>
                <strong className="text-foreground">Agro Konnecte Sénégal</strong> est né de ce constat : il manquait un lieu digital, sécurisé et humain
                capable de rassembler tous ces acteurs autour d'un même objectif : faire grandir l'agriculture sénégalaise.
              </p>
              <p>
                Nous avons imaginé une plateforme qui ne se contente pas de mettre en relation, mais qui accompagne, sécurise et valorise chaque projet.
                Chaque demande est étudiée par notre équipe pour garantir des mises en relation utiles, cohérentes et respectueuses de la confidentialité de chacun.
              </p>
              <p>
                Aujourd'hui, Agro Konnecte Sénégal, c'est un carrefour digital où l'expertise, l'ambition et la terre se rencontrent
                pour <strong className="text-foreground">connecter, investir, innover et cultiver l'avenir</strong>.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="glass-card overflow-hidden rounded-3xl shadow-premium">
                <img src={AKS_ASSETS.farmerTomatoes} alt="Agriculteur sénégalais avec ses tomates" className="h-[440px] w-full object-cover" loading="lazy" />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-white p-4 shadow-premium md:block">
                <p className="font-display text-xs font-bold uppercase tracking-widest text-primary">Notre promesse</p>
                <p className="mt-1 max-w-[220px] text-sm text-foreground">Sécurité, simplicité, efficacité au service de l'agriculture sénégalaise.</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              { icon: Users, t: "Un carrefour humain", d: "Rassembler agriculteurs, étudiants, investisseurs et cadres autour d'une même ambition." },
              { icon: HeartHandshake, t: "Une équipe engagée", d: "Chaque mise en relation est étudiée, accompagnée et sécurisée par notre équipe." },
              { icon: Leaf, t: "Un impact durable", d: "Faire grandir l'agriculture sénégalaise, projet après projet." },
            ].map((v) => (
              <div key={v.t} className="rounded-3xl border border-border bg-card p-6">
                <v.icon className="h-6 w-6 text-primary" />
                <h4 className="mt-2 font-display font-bold">{v.t}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFILS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">Quatre profils, un écosystème.</h2>
          <p className="mt-3 text-muted-foreground">La plateforme ne connecte jamais les utilisateurs directement chaque demande est étudiée par notre équipe.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* PUBLICITÉS | CARTES & VIDÉOS */}
      <AdSlot placement="card" title="Ils soutiennent l'agriculture sénégalaise" limit={3} />
      <AdSlot placement="video" title="En vidéo" limit={2} />

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
