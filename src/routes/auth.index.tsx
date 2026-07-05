import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

import { AuthShell } from "@/components/aks/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Connexion — AgroKonnecte Sénégal" },
      { name: "description", content: "Connectez-vous à votre espace AgroKonnecte Sénégal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      if (error) throw error;
      toast.success("Connexion réussie");
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setLoading(false); }
  }

  async function google() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) { toast.error(result.error.message ?? "Erreur Google"); setLoading(false); return; }
      if (result.redirected) return;
      nav({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-center font-display text-2xl font-extrabold">
        Bienvenue sur <span className="text-primary">AgroKonnecte</span>
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        La plateforme qui connecte les acteurs de l'agriculture et construit l'avenir ensemble.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input name="email" type="email" placeholder="Email ou numéro de téléphone" className="h-12 rounded-2xl bg-white/80 pl-10" required />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input name="password" type={showPwd ? "text" : "password"} placeholder="Mot de passe" className="h-12 rounded-2xl bg-white/80 pl-10 pr-10" required />
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox id="remember" /> <span>Se souvenir de moi</span>
          </label>
          <Link to="/auth/reset-password" className="text-sm font-semibold text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-aks font-display text-base font-semibold text-white shadow-premium transition hover:scale-[1.01] disabled:opacity-60">
          {loading ? "…" : <>Se connecter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
        </button>

        <div className="relative py-2 text-center text-xs text-muted-foreground">
          <span className="bg-transparent px-3">ou continuer avec</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={google} className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm font-semibold shadow-sm transition hover:bg-secondary">
            <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.9 35.5 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
            Google
          </button>
          <button type="button" onClick={() => toast.info("Apple : bientôt disponible")} className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm font-semibold shadow-sm transition hover:bg-secondary">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.44 2.24-1.16 3.05-.78.9-2.05 1.6-3.14 1.52-.12-1.1.44-2.28 1.15-3.05.78-.86 2.13-1.5 3.15-1.52zM20.63 17.24c-.53 1.16-.78 1.68-1.47 2.7-.96 1.43-2.32 3.22-4.02 3.23-1.5.02-1.9-.98-3.94-.98-2.04.01-2.47 1-3.98.99-1.7-.02-2.97-1.63-3.94-3.07C1.63 16.36.87 11.34 3.43 8.02c1.24-1.6 3.2-2.63 5.02-2.63 1.86 0 3.03 1.02 4.57 1.02 1.5 0 2.4-1.02 4.55-1.02 1.62 0 3.35.88 4.57 2.4-4.02 2.2-3.36 7.94-1.5 9.45z"/></svg>
            Apple
          </button>
        </div>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Vous n'avez pas de compte ?{" "}
          <Link to="/auth/register" className="font-semibold text-primary hover:underline">S'inscrire</Link>
        </p>
      </form>
    </AuthShell>
  );
}
