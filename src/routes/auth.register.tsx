import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/aks/AuthShell";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema } from "@/lib/schemas";

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

function Register() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"agriculteur" | "etudiant" | "investisseur">("agriculteur");
  const nav = useNavigate();

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

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Prénom</Label><Input name="prenom" required className="h-11 rounded-xl bg-white/80" /></div>
          <div><Label>Nom</Label><Input name="nom" required className="h-11 rounded-xl bg-white/80" /></div>
        </div>
        <div><Label>Email</Label><Input name="email" type="email" required className="h-11 rounded-xl bg-white/80" /></div>
        <div><Label>Téléphone</Label><Input name="telephone" required className="h-11 rounded-xl bg-white/80" /></div>
        <div><Label>Mot de passe (8+)</Label><Input name="password" type="password" required minLength={8} className="h-11 rounded-xl bg-white/80" /></div>
        <div>
          <Label>Profil</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="h-11 rounded-xl bg-white/80"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="agriculteur">Agriculteur</SelectItem>
              <SelectItem value="etudiant">Étudiant</SelectItem>
              <SelectItem value="investisseur">Investisseur</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Région</Label><Input name="region" className="h-11 rounded-xl bg-white/80" /></div>
          <div><Label>Commune</Label><Input name="commune" className="h-11 rounded-xl bg-white/80" /></div>
        </div>
        <PremiumButton type="submit" fullWidth loading={loading}>Créer mon compte</PremiumButton>
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Déjà inscrit ? <Link to="/auth" className="font-semibold text-primary hover:underline">Se connecter</Link>
        </p>
      </form>
    </AuthShell>
  );
}
