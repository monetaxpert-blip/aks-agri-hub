import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import logoUrl from "@/assets/ak-logo.png";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/aks/Navbar";
import { Footer } from "@/components/aks/Footer";
import { recordLogin, recordLogout } from "@/lib/user.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vous pouvez réessayer ou retourner à l'accueil.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Réessayer</button>
          <a href="/" className="rounded-xl border border-border px-4 py-2 text-sm">Accueil</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AgroKonnecte Sénégal | Carrefour digital de l'agriculture" },
      { name: "description", content: "AgroKonnecte Sénégal est l'espace digital dédié au secteur agricole. Nous connectons agriculteurs, étudiants, investisseurs et cadres de manière sécurisée, simple et efficace pour faciliter le développement de projets à fort impact." },
      { name: "author", content: "AgroKonnecte Sénégal" },
      { name: "theme-color", content: "#2E7D32" },
      { property: "og:title", content: "AgroKonnecte Sénégal | Carrefour digital de l'agriculture" },
      { property: "og:description", content: "L'espace digital dédié au secteur agricole sénégalais. Agriculteurs • Étudiants • Investisseurs • Cadres." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "AgroKonnecte Sénégal" },
      { property: "og:locale", content: "fr_SN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AgroKonnecte Sénégal | Carrefour digital de l'agriculture" },
      { name: "twitter:description", content: "L'espace digital dédié au secteur agricole sénégalais. Agriculteurs • Étudiants • Investisseurs • Cadres." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/uBTkTKjMX3Z6cxxTS34SzE46jZc2/social-images/social-1783131101023-logo_agro_konnecte.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/uBTkTKjMX3Z6cxxTS34SzE46jZc2/social-images/social-1783131101023-logo_agro_konnecte.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: logoUrl },
      { rel: "apple-touch-icon", href: logoUrl },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AgroKonnecte Sénégal",
          alternateName: ["Agro Konnecte Sénégal", "SENAKS", "AKS"],
          url: "https://www.senaks.company/",
          logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/uBTkTKjMX3Z6cxxTS34SzE46jZc2/social-images/social-1783131101023-logo_agro_konnecte.webp",
          description:
            "Plateforme digitale d'intermédiation agricole au Sénégal : agriculteurs, étudiants, investisseurs et cadres.",
          areaServed: "SN",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AgroKonnecte Sénégal",
          url: "https://www.senaks.company/",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        recordLogin().catch(() => {});
        router.invalidate();
      } else if (event === "SIGNED_OUT") {
        queryClient.clear();
        router.invalidate();
      } else if (event === "USER_UPDATED") {
        router.invalidate();
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideChrome = pathname.startsWith("/auth") || pathname.startsWith("/admin/login") || pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      {!hideChrome && <Navbar />}
      <main className="min-h-[60vh]">
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

// export used server fn without unused import warning
void recordLogout;
