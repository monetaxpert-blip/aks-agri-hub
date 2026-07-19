import { Link } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { AKS_CONTACT } from "@/lib/aks-assets";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-gradient-to-b from-background to-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Logo className="h-12 w-auto" />
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            AgroKonnecte Sénégal est l'espace digital dédié au secteur agricole. Nous connectons agriculteurs, étudiants, investisseurs et cadres — de manière sécurisée, simple et efficace — pour faciliter le développement de projets à fort impact.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Accueil</Link></li>
            <li><Link to="/a-propos" className="hover:text-primary">À propos</Link></li>
            <li><Link to="/comment-ca-marche" className="hover:text-primary">Comment ça marche</Link></li>
            <li><Link to="/partenaires" className="hover:text-primary">Partenaires</Link></li>
            <li><Link to="/rendez-vous" className="hover:text-primary">Prendre un rendez-vous</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {AKS_CONTACT.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${AKS_CONTACT.email}`} className="hover:text-primary">{AKS_CONTACT.email}</a></li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> <a href={AKS_CONTACT.waLink()} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Agro Konnecte Sénégal — Connecter l'agriculture sénégalaise au futur.
      </div>
    </footer>
  );
}
