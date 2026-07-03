import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/aks/AuthShell";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initializeAdmin } from "@/lib/init-admin.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Administration — AKS" },
      { name: "description", content: "Connexion administrateur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [initing, setIniting] = useState(false);
  const nav = useNavigate();
  const init = useServerFn(initializeAdmin);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      if (error) throw error;
      // Check role
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
      if (!roles?.some((r) => r.role === "admin")) {
        await supabase.auth.signOut();
        throw new Error("Ce compte n'est pas administrateur.");
      }
      toast.success("Bienvenue Administrateur");
      nav({ to: "/admin" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setLoading(false); }
  }

  async function bootstrap() {
    setIniting(true);
    try {
      const res = await init();
      if (!res.ok) toast.error(res.error);
      else toast.success(`Admin initialisé : ${res.email}. Vous pouvez maintenant vous connecter.`);
    } finally { setIniting(false); }
  }

  return (
    <AuthShell>
      <div className="mb-2 flex items-center justify-center gap-2 text-primary">
        <Lock className="h-5 w-5" />
        <span className="font-display text-sm font-bold uppercase tracking-widest">Administration</span>
      </div>
      <h1 className="text-center font-display text-2xl font-extrabold">Connexion Administrateur</h1>
      <form onSubmit={signIn} className="mt-6 space-y-4">
        <div><Label>Email</Label><Input name="email" type="email" required defaultValue="agrokonnectesenegal@gmail.com" className="h-11 rounded-xl bg-white/80" /></div>
        <div><Label>Mot de passe</Label><Input name="password" type="password" required className="h-11 rounded-xl bg-white/80" /></div>
        <PremiumButton type="submit" fullWidth loading={loading}>Se connecter</PremiumButton>
      </form>
      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">Premier accès ? Initialisez l'administrateur avec le mot de passe configuré côté serveur.</p>
        <button onClick={bootstrap} disabled={initing} className="mt-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50">
          {initing ? "Initialisation…" : "Initialiser l'administrateur"}
        </button>
      </div>
    </AuthShell>
  );
}
