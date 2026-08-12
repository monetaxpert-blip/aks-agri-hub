import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createPublicite } from "@/lib/ads.functions";
import { publiciteSchema } from "@/lib/schemas";
import { UploadDropzone, type UploadedFile } from "@/components/aks/UploadDropzone";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/dashboard/publicites/nouvelle")({
  head: () => ({
    meta: [
      { title: "Nouvelle campagne publicitaire | AgroKonnecte Sénégal" },
      { name: "description", content: "Soumettez une campagne publicitaire à l'équipe AgroKonnecte Sénégal." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Nouvelle campagne | AgroKonnecte Sénégal" },
      { property: "og:description", content: "Espace annonceur AgroKonnecte Sénégal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NouvellePub,
});

function NouvellePub() {
  const nav = useNavigate();
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [placement, setPlacement] = useState<"banner" | "card" | "video" | "feed">("card");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const media = files[0];
    if (!media) return toast.error("Ajoutez un visuel (image ou vidéo).");
    const fd = new FormData(e.currentTarget);
    const parsed = publiciteSchema.safeParse({
      titre: String(fd.get("titre") ?? ""),
      description: String(fd.get("description") ?? ""),
      media_type: media.type.startsWith("video/") ? "video" : "image",
      media_url: media.url,
      media_path: media.path,
      placement,
      lien_url: String(fd.get("lien_url") ?? ""),
      contact_nom: String(fd.get("contact_nom") ?? ""),
      contact_email: String(fd.get("contact_email") ?? ""),
      contact_telephone: String(fd.get("contact_telephone") ?? ""),
      periode_souhaitee_debut: String(fd.get("periode_souhaitee_debut") ?? ""),
      periode_souhaitee_fin: String(fd.get("periode_souhaitee_fin") ?? ""),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");

    setLoading(true);
    try {
      await createPublicite({ data: parsed.data });
      toast.success("Campagne envoyée, en attente de validation par l'équipe AKS.");
      nav({ to: "/dashboard/publicites" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">Nouvelle campagne publicitaire</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Votre campagne sera enregistrée avec le statut « En attente » puis examinée par l'équipe AKS.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
        <div><Label>Titre de la campagne</Label><Input name="titre" required maxLength={160} className="h-11 rounded-xl" /></div>
        <div><Label>Description / message</Label><Textarea name="description" rows={4} maxLength={2000} className="rounded-xl" /></div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Emplacement souhaité</Label>
            <Select value={placement} onValueChange={(v) => setPlacement(v as typeof placement)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Bannière</SelectItem>
                <SelectItem value="card">Carte partenaire</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="feed">Fil d'actualité</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Lien (https://)</Label><Input name="lien_url" placeholder="https://votre-site.com" className="h-11 rounded-xl" /></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Début souhaité</Label><Input name="periode_souhaitee_debut" type="date" className="h-11 rounded-xl" /></div>
          <div><Label>Fin souhaitée</Label><Input name="periode_souhaitee_fin" type="date" className="h-11 rounded-xl" /></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label>Contact</Label><Input name="contact_nom" className="h-11 rounded-xl" /></div>
          <div><Label>Email</Label><Input name="contact_email" type="email" className="h-11 rounded-xl" /></div>
          <div><Label>Téléphone</Label><Input name="contact_telephone" className="h-11 rounded-xl" /></div>
        </div>

        <div>
          <Label>Visuel (image ou vidéo)</Label>
          {userId && (
            <UploadDropzone
              bucket="publicites"
              userId={userId}
              value={files}
              onChange={setFiles}
              maxFiles={1}
              maxSizeMB={25}
              accept={{
                "image/*": [".png", ".jpg", ".jpeg", ".webp"],
                "video/mp4": [".mp4"],
                "video/webm": [".webm"],
              }}
            />
          )}
        </div>

        <PremiumButton type="submit" fullWidth loading={loading}>Envoyer pour validation</PremiumButton>
      </form>
    </div>
  );
}
