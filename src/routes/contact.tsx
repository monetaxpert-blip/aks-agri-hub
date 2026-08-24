import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { contactSchema } from "@/lib/schemas";
import { submitContact } from "@/lib/public.functions";
import { AKS_CONTACT } from "@/lib/aks-assets";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact, AgroKonnecte Sénégal" },
      { name: "description", content: "Contactez l'équipe AgroKonnecte Sénégal par formulaire, téléphone, email ou WhatsApp." },
      { property: "og:title", content: "Contact AKS" },
      { property: "og:description", content: "Écrivez-nous, appelez-nous ou passez par WhatsApp." },
      { property: "og:url", content: "https://www.senaks.company/contact" },
    ],
    links: [{ rel: "canonical", href: "https://www.senaks.company/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [loading, setLoading] = useState(false);
  const submit = useServerFn(submitContact);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      nom: String(fd.get("nom") ?? ""),
      email: String(fd.get("email") ?? ""),
      telephone: String(fd.get("telephone") ?? ""),
      sujet: String(fd.get("sujet") ?? ""),
      message: String(fd.get("message") ?? ""),
      hp: String(fd.get("hp") ?? ""),
    };
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return;
    }
    setLoading(true);
    try {
      const res = await submit({ data: parsed.data });
      if (!res.ok) throw new Error(res.error);
      const waMsg = `Bonjour AKS,\n\n${parsed.data.nom}, ${parsed.data.email}\nSujet : ${parsed.data.sujet}\n\n${parsed.data.message}`;
      window.open(AKS_CONTACT.waLink(waMsg), "_blank");
      toast.success("Message envoyé, nous ouvrons WhatsApp pour vous.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Contactez-nous</h1>
          <p className="mt-3 text-muted-foreground">Écrivez-nous votre message est envoyé à notre équipe et une conversation WhatsApp s'ouvre pour un suivi rapide.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nom">Nom complet</Label>
                <Input id="nom" name="nom" required maxLength={200} />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" name="telephone" maxLength={30} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="sujet">Sujet</Label>
              <Input id="sujet" name="sujet" required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={6} required maxLength={5000} />
            </div>
            <PremiumButton type="submit" loading={loading} size="lg">Envoyer ma demande</PremiumButton>
          </form>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-bold">Nos coordonnées</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {AKS_CONTACT.phone}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${AKS_CONTACT.email}`} className="hover:text-primary">{AKS_CONTACT.email}</a></li>
              <li>
                <a href={AKS_CONTACT.waLink("Bonjour AKS, j'aimerais vous contacter.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
                  <MessageCircle className="h-4 w-4" /> WhatsApp direct
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
