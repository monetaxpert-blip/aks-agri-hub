import { AKS_ASSETS } from "@/lib/aks-assets";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "h-10 w-auto", withLink = true }: { className?: string; withLink?: boolean }) {
  const img = <img src={AKS_ASSETS.logo} alt="Agro Konnecte Sénégal" className={className} loading="eager" />;
  if (!withLink) return img;
  return (
    <Link to="/" className="inline-flex items-center">
      {img}
    </Link>
  );
}
