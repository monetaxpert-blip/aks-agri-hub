import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { rendezVousSchema } from "@/lib/schemas";
import { submitRendezVous } from "@/lib/public.functions";
import { AKS_CONTACT } from "@/lib/aks-assets";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/rendez-vous")({
  head: () => ({
    meta: [
      { title: "Prendre un rendez-vous — AgroKonnecte Sénégal" },
      { name: "description", content: "Réservez un rendez-vous avec l'équipe AKS. Présentiel, visioconférence ou WhatsApp." },
      { property: "og:title", content: "Rendez-vous — AKS" },
      { property: "og:description", content: "Réservez un créneau avec notre équipe." },
    ],
  }),
  component: RdvPage,
});

function RdvPage() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"presentiel" | "visio" | "whatsapp">("presentiel");
  const [profil, setProfil] = useState<string>("");
  const submit = useServerFn(submitRendezVous);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      nom: String(fd.get("nom") ?? ""),
      email: String(fd.get("email") ?? ""),
      telephone: String(fd.get("telephone") ?? ""),
      profil,
      date_souhaitee: String(fd.get("date") ?? ""),
      heure_souhaitee: String(fd.get("heure") ?? ""),
      lieu: String(fd.get("lieu") ?? ""),
      mode,
      objet: String(fd.get("objet") ?? ""),
      description: String(fd.get("description") ?? ""),
      hp: String(fd.get("hp") ?? ""),
    };
    const parsed = rendezVousSchema.safeParse(raw);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
    setLoading(true);
    try {
      const res = await submit({ data: parsed.data });
      if (!res.ok) throw new Error(res.error);
      toast.success("Votre demande a été envoyée à notre équipe. Nous vous recontactons rapidement.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-extrabold md:text-5xl">Prendre un rendez-vous</h1>
      <p className="mt-3 text-muted-foreground">Choisissez un créneau et un mode. Notre équipe vous confirme sous 24–48h.</p>
      <p className="mt-2 text-xs text-muted-foreground">Ou contactez-nous directement : {AKS_CONTACT.phone} · {AKS_CONTACT.email}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
        <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Nom complet</Label><Input name="nom" required maxLength={200} /></div>
          <div><Label>Téléphone</Label><Input name="telephone" required maxLength={30} /></div>
          <div><Label>Email</Label><Input name="email" type="email" required maxLength={200} /></div>
          <div>
            <Label>Profil</Label>
            <Select value={profil} onValueChange={setProfil}>
              <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agriculteur">Agriculteur</SelectItem>
                <SelectItem value="etudiant">Étudiant</SelectItem>
                <SelectItem value="investisseur">Investisseur</SelectItem>
                <SelectItem value="cadre">Cadre</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Date souhaitée</Label><Input name="date" type="date" required /></div>
          <div><Label>Heure souhaitée</Label><Input name="heure" type="time" required /></div>
          <div>
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="presentiel">Présentiel</SelectItem>
                <SelectItem value="visio">Visioconférence</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Lieu (facultatif)</Label><Input name="lieu" maxLength={200} placeholder="Adresse, lien visio…" /></div>
        </div>
        <div><Label>Objet</Label><Input name="objet" required maxLength={200} /></div>
        <div><Label>Description</Label><Textarea name="description" rows={4} maxLength={3000} /></div>
        <PremiumButton type="submit" loading={loading} size="lg">Envoyer ma demande</PremiumButton>
      </form>
    </div>
  );
}
