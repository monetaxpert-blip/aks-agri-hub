import { AKS_ASSETS } from "@/lib/aks-assets";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${AKS_ASSETS.leafyBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/60" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center">
        <div className="mb-6 flex flex-col items-center">
          <img src={AKS_ASSETS.logo} alt="AKS" className="h-32 w-auto drop-shadow-lg" />
        </div>
        <div className="glass-card w-full rounded-3xl border border-white/60 p-6 shadow-premium md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
