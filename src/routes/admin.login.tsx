import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/aks/AuthShell";
import { PremiumButton } from "@/components/aks/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Administration | AKS" },
      { name: "description", content: "Connexion administrateur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

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
    </AuthShell>
  );
}
