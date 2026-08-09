import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/aks/AuthShell";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema, proDetailsSchema, annonceurDetailsSchema } from "@/lib/schemas";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Créer un compte — AgroKonnecte Sénégal" },
      { name: "description", content: "Créez votre compte AgroKonnecte Sénégal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Register,
});

type Profil = "agriculteur" | "etudiant" | "investisseur" | "cadre" | "annonceur";

function Register() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<Profil>("agriculteur");
  const nav = useNavigate();

  const isPro = type === "investisseur" || type === "cadre";
  const isAnnonceur = type === "annonceur";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      prenom: String(fd.get("prenom") ?? ""),
      nom: String(fd.get("nom") ?? ""),
      email: String(fd.get("email") ?? ""),
      telephone: String(fd.get("telephone") ?? ""),
      password: String(fd.get("password") ?? ""),
      type_profil: type,
      region: String(fd.get("region") ?? ""),
      commune: String(fd.get("commune") ?? ""),
    };
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");

    let pro: ReturnType<typeof proDetailsSchema.parse> | null = null;
    if (isPro) {
      const proRaw = {
        profession: String(fd.get("profession") ?? ""),
        organisation: String(fd.get("organisation") ?? ""),
        fonction: String(fd.get("fonction") ?? ""),
        secteur_activite: String(fd.get("secteur_activite") ?? ""),
        pays: String(fd.get("pays") ?? ""),
        ville: String(fd.get("ville") ?? ""),
        capacite_investissement: String(fd.get("capacite_investissement") ?? ""),
        domaine_interet: String(fd.get("domaine_interet") ?? ""),
        experience: String(fd.get("experience") ?? ""),
      };
      const proParsed = proDetailsSchema.safeParse(proRaw);
      if (!proParsed.success) return toast.error(proParsed.error.issues[0]?.message ?? "Champs professionnels invalides");
      pro = proParsed.data;
    }

    let annonceur: ReturnType<typeof annonceurDetailsSchema.parse> | null = null;
    if (isAnnonceur) {
      const aRaw = {
        entreprise: String(fd.get("entreprise") ?? ""),
        responsable: String(fd.get("responsable") ?? ""),
        email: String(fd.get("contact_email") ?? ""),
        telephone: String(fd.get("contact_telephone") ?? ""),
        secteur_activite: String(fd.get("secteur_activite_ann") ?? ""),
        localisation: String(fd.get("localisation") ?? ""),
        description: String(fd.get("description_ann") ?? ""),
        logo_url: String(fd.get("logo_url") ?? ""),
        site_web: String(fd.get("site_web") ?? ""),
        infos_complementaires: String(fd.get("infos_complementaires") ?? ""),
      };
      const aParsed = annonceurDetailsSchema.safeParse(aRaw);
      if (!aParsed.success) return toast.error(aParsed.error.issues[0]?.message ?? "Informations entreprise invalides");
      annonceur = aParsed.data;
    }

    setLoading(true);
    try {
      const { data: signUp, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            prenom: parsed.data.prenom,
            nom: parsed.data.nom,
            telephone: parsed.data.telephone,
            type_profil: parsed.data.type_profil,
            region: parsed.data.region,
            commune: parsed.data.commune,
          },
        },
      });
      if (error) throw error;

      if (pro && signUp.user) {
        // Upsert des informations professionnelles (Investisseurs / Cadres)
        await supabase.from("investisseur_details").upsert({
          user_id: signUp.user.id,
          profession: pro.profession || null,
          organisation: pro.organisation || null,
          fonction: pro.fonction || null,
          secteur_activite: pro.secteur_activite || null,
          pays: pro.pays || null,
          ville: pro.ville || null,
          capacite_investissement: pro.capacite_investissement || null,
          domaine_interet: pro.domaine_interet || null,
          experience: pro.experience || null,
        });
      }

      if (annonceur && signUp.user) {
        await supabase.from("annonceur_details").upsert({
          user_id: signUp.user.id,
          entreprise: annonceur.entreprise,
          responsable: annonceur.responsable || null,
          email: annonceur.email || null,
          telephone: annonceur.telephone || null,
          secteur_activite: annonceur.secteur_activite || null,
          localisation: annonceur.localisation || null,
          description: annonceur.description || null,
          logo_url: annonceur.logo_url || null,
          site_web: annonceur.site_web || null,
          infos_complementaires: annonceur.infos_complementaires || null,
        });
      }

      toast.success("Compte créé, bienvenue !");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setLoading(false); }
  }

  return (
    <AuthShell>
      <h1 className="text-center font-display text-2xl font-extrabold">Créer un compte</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">Rejoignez l'écosystème AKS</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <div>
          <Label>Profil</Label>
          <Select value={type} onValueChange={(v) => setType(v as Profil)}>
            <SelectTrigger className="h-11 rounded-xl bg-white/80"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="agriculteur">Agriculteur</SelectItem>
              <SelectItem value="etudiant">Étudiant</SelectItem>
              <SelectItem value="investisseur">Investisseur</SelectItem>
              <SelectItem value="cadre">Cadre</SelectItem>
              <SelectItem value="annonceur">Annonceur</SelectItem>
            </SelectContent>
          </Select>
          {isPro && (
            <p className="mt-1 text-xs text-muted-foreground">
              Parcours enrichi : merci de compléter vos informations professionnelles ci-dessous.
            </p>
          )}
          {isAnnonceur && (
            <p className="mt-1 text-xs text-muted-foreground">
              Parcours annonceur : présentez votre entreprise. Vos campagnes seront validées par l'équipe AKS.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><Label>Prénom</Label><Input name="prenom" required className="h-11 rounded-xl bg-white/80" /></div>
          <div><Label>Nom</Label><Input name="nom" required className="h-11 rounded-xl bg-white/80" /></div>
        </div>
        <div><Label>Email</Label><Input name="email" type="email" required className="h-11 rounded-xl bg-white/80" /></div>
        <div><Label>Téléphone</Label><Input name="telephone" required className="h-11 rounded-xl bg-white/80" /></div>
        <div><Label>Mot de passe (8+)</Label><Input name="password" type="password" required minLength={8} className="h-11 rounded-xl bg-white/80" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Région</Label><Input name="region" className="h-11 rounded-xl bg-white/80" /></div>
          <div><Label>Commune</Label><Input name="commune" className="h-11 rounded-xl bg-white/80" /></div>
        </div>

        {isPro && (
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Informations professionnelles
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Profession</Label><Input name="profession" className="h-11 rounded-xl bg-white/80" /></div>
              <div><Label>Fonction / Poste</Label><Input name="fonction" className="h-11 rounded-xl bg-white/80" /></div>
            </div>
            <div><Label>Société / Organisation</Label><Input name="organisation" className="h-11 rounded-xl bg-white/80" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Secteur d'activité</Label><Input name="secteur_activite" className="h-11 rounded-xl bg-white/80" /></div>
              <div><Label>Pays</Label><Input name="pays" className="h-11 rounded-xl bg-white/80" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ville</Label><Input name="ville" className="h-11 rounded-xl bg-white/80" /></div>
              {type === "investisseur" && (
                <div><Label>Capacité d'investissement</Label><Input name="capacite_investissement" placeholder="ex: 5–20 M FCFA" className="h-11 rounded-xl bg-white/80" /></div>
              )}
            </div>
            <div><Label>Domaine d'intérêt</Label><Input name="domaine_interet" placeholder="ex: maraîchage, élevage, transformation" className="h-11 rounded-xl bg-white/80" /></div>
            <div><Label>Expérience</Label><Textarea name="experience" rows={3} className="rounded-xl bg-white/80" placeholder="Brève description de votre parcours" /></div>
          </div>
        )}

        {isAnnonceur && (
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Informations entreprise
            </p>
            <div><Label>Nom de l'entreprise / marque</Label><Input name="entreprise" required className="h-11 rounded-xl bg-white/80" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Responsable</Label><Input name="responsable" className="h-11 rounded-xl bg-white/80" /></div>
              <div><Label>Secteur d'activité</Label><Input name="secteur_activite_ann" className="h-11 rounded-xl bg-white/80" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email professionnel</Label><Input name="contact_email" type="email" className="h-11 rounded-xl bg-white/80" /></div>
              <div><Label>Téléphone pro</Label><Input name="contact_telephone" className="h-11 rounded-xl bg-white/80" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Localisation</Label><Input name="localisation" className="h-11 rounded-xl bg-white/80" /></div>
              <div><Label>Site web (https://)</Label><Input name="site_web" placeholder="https://…" className="h-11 rounded-xl bg-white/80" /></div>
            </div>
            <div><Label>Logo (URL)</Label><Input name="logo_url" className="h-11 rounded-xl bg-white/80" /></div>
            <div><Label>Présentation</Label><Textarea name="description_ann" rows={3} className="rounded-xl bg-white/80" /></div>
            <div><Label>Informations complémentaires</Label><Textarea name="infos_complementaires" rows={2} className="rounded-xl bg-white/80" /></div>
          </div>
        )}

        <PremiumButton type="submit" fullWidth loading={loading}>Créer mon compte</PremiumButton>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Déjà inscrit ? <Link to="/auth" className="font-semibold text-primary hover:underline">Se connecter</Link>
        </p>
      </form>
    </AuthShell>
  );
}
