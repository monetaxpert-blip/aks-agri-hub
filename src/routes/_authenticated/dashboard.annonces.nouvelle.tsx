import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createAnnonce } from "@/lib/user.functions";
import { annonceSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { UploadDropzone, type UploadedFile } from "@/components/aks/UploadDropzone";

export const Route = createFileRoute("/_authenticated/dashboard/annonces/nouvelle")({
  component: New,
});

function New() {
  const [uid, setUid] = useState<string>("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const create = useServerFn(createAnnonce);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? ""));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      titre: String(fd.get("titre") ?? ""),
      description: String(fd.get("description") ?? ""),
      categorie: String(fd.get("categorie") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      region: String(fd.get("region") ?? ""),
      pieces_jointes: files,
    };
    const parsed = annonceSchema.safeParse(raw);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
    setLoading(true);
    try {
      await create({ data: parsed.data });
      toast.success("Annonce envoyée à l'équipe AKS pour analyse.");
      nav({ to: "/dashboard/annonces" });
    } catch (err) { toast.error((err as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold">Nouvelle annonce</h1>
      <p className="text-sm text-muted-foreground">Votre annonce est visible uniquement par l'équipe AKS.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div><Label>Titre</Label><Input name="titre" required maxLength={200} /></div>
        <div><Label>Description</Label><Textarea name="description" rows={6} required maxLength={5000} /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Catégorie</Label><Input name="categorie" placeholder="ex. Financement" /></div>
          <div><Label>Budget</Label><Input name="budget" placeholder="ex. 5M FCFA" /></div>
          <div><Label>Région</Label><Input name="region" /></div>
        </div>
        <div>
          <Label>Pièces jointes (facultatif)</Label>
          {uid && <UploadDropzone bucket="annonces" userId={uid} value={files} onChange={setFiles} />}
        </div>
        <PremiumButton type="submit" loading={loading} size="lg">Envoyer ma demande</PremiumButton>
      </form>
    </div>
  );
}
