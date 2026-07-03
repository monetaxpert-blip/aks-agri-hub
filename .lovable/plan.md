
# AGRO KONNECTE SÉNÉGAL — Plan V1 complet (révisé)

Livraison en une seule itération : frontend premium fidèle aux maquettes, backend Lovable Cloud, dashboards utilisateur et administrateur ultra-complets. Philosophie stricte : **plateforme d'intermédiation** — jamais réseau social ni marketplace, aucune interaction directe entre utilisateurs.

## 1. Design system & assets fournis (obligatoire)

- Palette : Vert AKS `#2E7D32`, dégradé `#2E7D32 → #4CAF50 → #81C784`, Jaune `#FBC02D`, Marron `#6D4C41`, Noir `#121212`. Tokens sémantiques oklch dans `src/styles.css`.
- Typographies via `@fontsource` : Montserrat (400/600/800) titres/boutons, Inter texte.
- Coins 16–20 px, ombres douces, glassmorphism, animations Motion 250–300 ms.
- **Utilisation exclusive des images fournies** (upload CDN via `lovable-assets`) :
  - Logo AKS → navbar, page login/register/reset, footer, favicon, splash, dashboards user & admin, backgrounds subtils.
  - Splash screen fourni → reproduit fidèlement au premier chargement (~1,5 s fade).
  - Fond vert leafy fourni → login, register, reset password.
  - Photos agriculteurs (labour + tomates) → hero landing, section « À propos », pages informatives.
- Aucune image générique/IA/stock. Formats servis en WebP via CDN, `loading="lazy"`, ratios préservés, responsive.

## 2. Page de connexion (fidèle à la maquette)

Reproduction quasi identique :
- Fond leafy vert plein écran (image fournie).
- Sélecteur langue FR en haut à droite.
- Logo AKS centré + baseline « CONNECTER • INVESTIR • INNOVER • CULTIVER L'AVENIR ».
- Carte blanche arrondie (20 px) avec ombre douce et léger glassmorphism : « Bienvenue sur **AgroKonnecte** » + sous-titre.
- Champ email/téléphone avec icône user verte ; champ mot de passe avec icône cadenas + toggle œil.
- Checkbox « Se souvenir de moi » + lien vert « Mot de passe oublié ? ».
- Bouton « Se connecter » **dégradé vert AKS** pleine largeur avec flèche animée au hover et ombre premium.
- Séparateur « ou continuer avec ».
- Boutons Google, Facebook, Apple (Google fonctionnel via broker Lovable ; Facebook/Apple visuels + info « bientôt » si non configurés — Facebook non supporté nativement Cloud).
- « Vous n'avez pas de compte ? **S'inscrire** ».
- Transitions fluides, responsive mobile complet.
- Pages `/auth/register` et `/auth/reset-password` reprennent exactement le même chrome.

## 3. Routes (TanStack Start)

**Publiques** : `/` (landing hero photo agriculteur + dégradé, mission, 3 profils, comment ça marche, partenaires, CTA « Get Started » dégradé), `/a-propos`, `/comment-ca-marche`, `/partenaires`, `/contact` (WhatsApp `wa.me/221762886107` message pré-rempli + enregistrement DB), `/rendez-vous` (formulaire public → DB admin), `/auth`, `/auth/register`, `/auth/reset-password`, `/admin/login` (page distincte).

**Protégées user `_authenticated/`** : `/dashboard`, `/dashboard/profil`, `/dashboard/annonces`, `/dashboard/annonces/nouvelle` (upload drag & drop), `/dashboard/rendez-vous`. Aucune vue sur les autres utilisateurs — pas de messagerie, likes, commentaires.

**Admin `_authenticated/admin/`** (gate `has_role('admin')` + protection stricte) : `/admin`, `/admin/utilisateurs`, `/admin/utilisateurs/$id`, `/admin/annonces`, `/admin/annonces/$id`, `/admin/rendez-vous`, `/admin/contacts`, `/admin/partenaires`, `/admin/audit`.

Splash screen affiché au premier chargement (image fournie).

## 4. Backend (Lovable Cloud)

### Tables (SQL migrations + GRANT + RLS)

- **enums** : `app_role` (admin, user), `type_profil` (agriculteur, etudiant, investisseur), `annonce_statut` (pending, validated, rejected, archived), `rdv_statut` (pending, planifie, termine, annule), `rdv_mode` (presentiel, visio, whatsapp), `user_statut` (active, suspended).
- `profiles` : id, prenom, nom, telephone, avatar_url, type_profil, adresse, region, commune, bio, statut, derniere_connexion, nb_connexions, created_at.
- `agriculteur_details`, `etudiant_details`, `investisseur_details` (champs spécifiques : surface/cultures ; école/filière/niveau ; capacité d'investissement/secteurs).
- `user_roles` (user_id, role) + fonction `has_role(_user_id, _role)` SECURITY DEFINER.
- `annonces` : id, user_id, titre, description, categorie, budget, region, pieces_jointes jsonb, statut, admin_notes, created_at, updated_at.
- `annonce_history` : modifications annonces (id, annonce_id, admin_id, field, old, new, at).
- `rendez_vous` : id, user_id (nullable), annonce_id (nullable), nom, email, telephone, profil, date, heure, lieu, mode, objet, description, statut, admin_notes, created_at.
- `contacts` : nom, telephone, email, sujet, message, created_at.
- `partenaires` : nom, logo_url, url, description, ordre.
- `activity_log` : user_id, action, metadata jsonb (ip, user_agent, os, browser dérivés), created_at. **Toutes actions importantes** : login, logout, register, modif profil, création/modif/suppression annonce, prise RDV, changement statut.
- `admin_audit_log` : admin_id, action, target_type, target_id, metadata, created_at.
- `rate_limits` : clé + fenêtre pour throttler formulaires publics/auth.

### RLS (stricte — philosophie intermédiation)

- `profiles` : user lit/modifie **son seul** profil ; admin lit/modifie tout. Aucune lecture cross-user.
- `annonces` : owner CRUD ses propres annonces (lecture uniquement des siennes) ; admin lit/modifie tout.
- `rendez_vous`, `contacts` : `INSERT` anon+authenticated ; `SELECT` admin uniquement.
- `activity_log`, `admin_audit_log` : insert via server fns/triggers ; lecture admin uniquement.
- `partenaires` : lecture publique, écriture admin.
- `user_roles` : lecture `has_role` uniquement ; écriture admin. **Le rôle admin ne peut être attribué que via base de données** (aucun endpoint public).
- Triggers : `handle_new_user` (crée profile + log activité), triggers audit sur changements annonces/rdv/profil.

### Storage

Buckets `avatars` (public) et `annonces` (public) via `supabase--storage_create_bucket`. RLS objects : write owner, read public.

### Server functions

**User** : `getMyStats`, `getMyAnnonces`, `createAnnonce`, `updateAnnonce`, `deleteAnnonce`, `updateProfile`, `getMyRendezVous`, `submitRendezVous` (public), `submitContact` (public).

**Admin** (`requireSupabaseAuth` + check `has_role('admin')`) : `getAdminStats` (totaux, par profil, annonces par statut, RDV, connexions du jour, nouveaux inscrits, séries temporelles), `listUsers` (recherche + filtres profil/région/statut/période), `getUserDetail` (profil + historique complet + annonces + RDV + connexions), `updateUser`, `suspendUser`, `reactivateUser`, `deleteUser` (via `supabaseAdmin`), `listAnnonces` (filtres statut), `moderateAnnonce` (validate/reject/archive + note), `updateAnnonce` admin, `deleteAnnonce` admin, `scheduleRendezVousFromAnnonce`, `listRendezVous`, `updateRendezVous` (statut, mode, lieu, confirmation email), `listContacts`, `listAuditLog` (filtres user/action/période), `exportUsersCSV(filters)`.

Chaque action admin écrit dans `admin_audit_log` ; chaque action user écrit dans `activity_log` avec IP/UA/OS/browser dérivés de `getRequest()`.

## 5. Dashboard Admin ultra complet

Widgets stats temps réel : total users, agriculteurs, étudiants, investisseurs, total annonces, annonces en attente/validées/refusées, RDV planifiés/en attente, connexions aujourd'hui, nouveaux inscrits (jour/semaine/mois). Graphiques `recharts` : évolution inscriptions, annonces par jour, répartition par profil, RDV par statut. Feed « Dernières actions » (extraits activity_log + admin_audit_log).

## 6. Gestion utilisateurs

Liste avec recherche + filtres (profil, région, statut, période). Fiche détaillée `/$id` :
- Photo, nom, prénom, profession, email, téléphone, adresse, région, commune, type profil, statut, date d'inscription, dernière connexion, nombre de connexions, nombre d'annonces, nombre de RDV, IP dernière connexion, navigateur, OS (si dispo).
- Onglets : Historique complet, Annonces, Rendez-vous, Actions.
- Boutons : Voir, Modifier, Suspendre, Réactiver, Supprimer (confirmation).

## 7. Journal d'activité détaillé

Page `/admin/audit` : timeline chronologique par utilisateur avec filtre user/action/période. Format : `Mohamed Sarr — Connexion — 08:45`, etc. Toutes actions importantes historisées (login, logout, profile update, annonce create/update/delete, RDV, changements statut, admin actions).

## 8. Export CSV avancé

Bouton visible « Exporter CSV » sur `/admin/utilisateurs`. Filtres appliqués avant export : profil, région, statut, période. Colonnes : Nom, Prénom, Email, Téléphone, Profession, Profil, Région, Commune, Date inscription, Dernière connexion, Nombre d'annonces, Statut. Server fn stream le fichier ; téléchargement automatique ; log dans `admin_audit_log`.

## 9. Gestion annonces

Sur `/admin/annonces/$id` : voir tous champs + pièces jointes, valider, refuser (avec raison), modifier, supprimer, archiver, ajouter note admin, historique modifications (`annonce_history`), bouton **« Planifier un rendez-vous depuis cette annonce »**.

## 10. Prise de rendez-vous depuis annonce

Modal : date (datepicker), heure, mode (présentiel / visio / WhatsApp), lieu (ou lien visio / n° WhatsApp), objet, description. Envoi confirmation par email au demandeur (via server fn — utilise Resend si secret présent, sinon simple entrée DB avec note « à confirmer manuellement »).

## 11. Compte admin

- Page `/admin/login` distincte, chrome minimal (pas les OAuth publics).
- Email admin fixe : `agrokonnectesenegal@gmail.com`.
- Mot de passe via secret `ADMIN_INIT_PASSWORD` (jamais dans le code).
- Server fn `initializeAdmin` idempotente : si aucun `user_roles.admin` n'existe, crée l'utilisateur via `supabaseAdmin.auth.admin.createUser` avec le secret + insère `user_roles(admin)`. Bouton « Initialiser l'admin » visible sur `/admin/login` tant qu'aucun admin n'existe.
- Aucun endpoint public ne peut attribuer `admin`. Registration publique force `role='user'`.
- Un seul admin fonctionnel (le principal). RLS + gate côté route.

## 12. Sécurité maximale

- Supabase Auth (bcrypt géré côté Auth), JWT sécurisés, refresh tokens.
- RBAC via `user_roles` + `has_role`.
- Zod partout (client + `.inputValidator` server).
- Sanitization des entrées (pas de `dangerouslySetInnerHTML`).
- RLS stricte sur toutes les tables.
- Rate limiting sur `submitContact`, `submitRendezVous`, `/auth` (table `rate_limits`).
- Bot protection : honeypot + throttle IP.
- Upload sécurisé : validation type MIME + taille côté client & server, chemins scopés user_id.
- Secrets : `ADMIN_INIT_PASSWORD` uniquement (+ optionnel `RESEND_API_KEY`). Rien dans le frontend.
- HTTPS natif Lovable, secure deployment.
- Audit logs complets (activity + admin).
- Headers sécurité, protection CSRF via SameSite cookies + POST server fns.

## 13. Détails techniques

- Packages à ajouter : `@fontsource/montserrat`, `@fontsource/inter`, `react-dropzone`, `recharts`, `date-fns`, `motion`, `ua-parser-js` (pour navigator/OS depuis UA).
- `zod` déjà présent.
- `src/routes/__root.tsx` : metadata AKS, splash gate, wrapper Navbar/Footer conditionnel, `onAuthStateChange` (log connexion/déconnexion + `router.invalidate`).
- Favicon : logo AKS dans `public/favicon.png`, suppression `favicon.ico` par défaut.
- SEO : `head()` propre par route publique, og:image (photo hero) sur `/` uniquement.

## Livraison

1. J'active Lovable Cloud.
2. Je demande le secret `ADMIN_INIT_PASSWORD` (formulaire sécurisé — vous saisissez la valeur).
3. J'implémente tout (migrations, server fns, composants, pages).
4. Vous cliquez « Initialiser l'admin » sur `/admin/login` → compte créé.
5. Scan sécurité + corrections finales.

Prêt à builder ?
