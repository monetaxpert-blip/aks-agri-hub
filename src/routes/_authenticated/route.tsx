import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/aks/Logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, FileText, CalendarClock, LogOut, Shield, Megaphone, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [isAnnonceur, setIsAnnonceur] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      setRole(roles?.some((r) => r.role === "admin") ? "admin" : "user");
      const { data: profile } = await supabase.from("profiles").select("type_profil").eq("id", data.user.id).maybeSingle();
      setIsAnnonceur(profile?.type_profil === "annonceur");
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/" });
  }

  const userLinks = [
    { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/dashboard/profil", label: "Mon profil", icon: User },
    { to: "/dashboard/annonces", label: "Mes annonces", icon: FileText },
    { to: "/dashboard/rendez-vous", label: "Mes rendez-vous", icon: CalendarClock },
    ...(isAnnonceur
      ? [
          { to: "/dashboard/annonceur", label: "Ma fiche annonceur", icon: Building2 },
          { to: "/dashboard/publicites", label: "Mes publicités", icon: Megaphone },
        ]
      : []),
  ];
  const adminLinks = [
    { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
    { to: "/admin/utilisateurs", label: "Utilisateurs", icon: User },
    { to: "/admin/annonces", label: "Annonces", icon: FileText },
    { to: "/admin/rendez-vous", label: "Rendez-vous", icon: CalendarClock },
    { to: "/admin/publicites", label: "Publicités", icon: Megaphone },
    { to: "/admin/contacts", label: "Contacts", icon: FileText },
    { to: "/admin/partenaires", label: "Partenaires", icon: FileText },
    { to: "/admin/audit", label: "Journal d'activité", icon: Shield },
  ];
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="p-4"><Logo className="h-10 w-auto" /></div>
        {isAdmin && (
          <div className="mx-4 mb-3 rounded-xl bg-gradient-aks px-3 py-2 text-xs font-bold uppercase tracking-wider text-white">Administration</div>
        )}
        <nav className="space-y-1 px-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary" activeProps={{ className: "bg-primary/10 text-primary font-semibold" }} activeOptions={{ exact: l.to === "/dashboard" || l.to === "/admin" }}>
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          ))}
          {role === "admin" && !isAdmin && (
            <Link to="/admin" className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
              <Shield className="h-4 w-4" /> Espace admin
            </Link>
          )}
          {isAdmin && (
            <Link to="/dashboard" className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-secondary">
              <LayoutDashboard className="h-4 w-4" /> Retour espace user
            </Link>
          )}
        </nav>
        <div className="mt-6 border-t border-border p-2">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
          <div className="md:hidden"><Logo className="h-8" /></div>
          <div className="ml-auto flex items-center gap-2">
            {role === "admin" && !isAdmin && (
              <Link to="/admin"><Button variant="outline" size="sm" className="gap-2"><Shield className="h-4 w-4" /> Admin</Button></Link>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2"><LogOut className="h-4 w-4" /> Sortir</Button>
          </div>
        </header>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
