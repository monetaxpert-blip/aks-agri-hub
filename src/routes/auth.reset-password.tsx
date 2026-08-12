import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/aks/AuthShell";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié | AKS" },
      { name: "description", content: "Réinitialisez votre mot de passe AgroKonnecte." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"request" | "update">(() => {
    if (typeof window === "undefined") return "request";
    return window.location.hash.includes("type=recovery") ? "update" : "request";
  });

  async function request(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(String(fd.get("email") ?? ""), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Email envoyé si le compte existe.");
  }

  async function update(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: String(fd.get("password") ?? "") });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Mot de passe mis à jour"); setMode("request"); }
  }

  return (
    <AuthShell>
      <h1 className="text-center font-display text-2xl font-extrabold">
        {mode === "request" ? "Mot de passe oublié" : "Nouveau mot de passe"}
      </h1>
      {mode === "request" ? (
        <form onSubmit={request} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input name="email" type="email" required className="h-11 rounded-xl bg-white/80" /></div>
          <PremiumButton type="submit" fullWidth loading={loading}>Envoyer le lien</PremiumButton>
        </form>
      ) : (
        <form onSubmit={update} className="mt-6 space-y-4">
          <div><Label>Nouveau mot de passe</Label><Input name="password" type="password" required minLength={8} className="h-11 rounded-xl bg-white/80" /></div>
          <PremiumButton type="submit" fullWidth loading={loading}>Mettre à jour</PremiumButton>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to="/auth" className="font-semibold text-primary hover:underline">Retour à la connexion</Link>
      </p>
    </AuthShell>
  );
}
