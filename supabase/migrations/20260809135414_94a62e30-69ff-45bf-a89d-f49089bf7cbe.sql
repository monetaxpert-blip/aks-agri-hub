-- 1. Nouveau type de profil
ALTER TYPE public.type_profil ADD VALUE IF NOT EXISTS 'annonceur';

-- 2. Statuts publicitaires
DO $$ BEGIN
  CREATE TYPE public.pub_statut AS ENUM ('pending','approved','published','rejected','expired','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pub_media AS ENUM ('image','video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pub_placement AS ENUM ('banner','card','video','feed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Détails annonceur
CREATE TABLE IF NOT EXISTS public.annonceur_details (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  entreprise text NOT NULL DEFAULT '',
  responsable text,
  email text,
  telephone text,
  secteur_activite text,
  localisation text,
  description text,
  logo_url text,
  site_web text,
  infos_complementaires text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.annonceur_details TO authenticated;
GRANT ALL ON public.annonceur_details TO service_role;

ALTER TABLE public.annonceur_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY annonceur_details_self ON public.annonceur_details
  FOR ALL TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_annonceur_details_updated
  BEFORE UPDATE ON public.annonceur_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Publicités
CREATE TABLE IF NOT EXISTS public.publicites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  media_type public.pub_media NOT NULL DEFAULT 'image',
  media_url text NOT NULL,
  media_path text,
  placement public.pub_placement NOT NULL DEFAULT 'card',
  lien_url text,
  contact_nom text,
  contact_email text,
  contact_telephone text,
  periode_souhaitee_debut date,
  periode_souhaitee_fin date,
  date_debut timestamptz,
  date_fin timestamptz,
  statut public.pub_statut NOT NULL DEFAULT 'pending',
  admin_notes text,
  ordre integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publicites_statut ON public.publicites(statut);
CREATE INDEX IF NOT EXISTS idx_publicites_user ON public.publicites(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.publicites TO authenticated;
GRANT SELECT ON public.publicites TO anon;
GRANT ALL ON public.publicites TO service_role;

ALTER TABLE public.publicites ENABLE ROW LEVEL SECURITY;

CREATE POLICY publicites_owner_select ON public.publicites
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY publicites_public_read ON public.publicites
  FOR SELECT TO anon, authenticated
  USING (
    statut = 'published'
    AND (date_debut IS NULL OR date_debut <= now())
    AND (date_fin IS NULL OR date_fin >= now())
  );

CREATE POLICY publicites_owner_insert ON public.publicites
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY publicites_owner_update ON public.publicites
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY publicites_owner_delete ON public.publicites
  FOR DELETE TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

-- 5. Garde-fou : l'annonceur ne contrôle jamais la modération
CREATE OR REPLACE FUNCTION public.publicites_guard_owner_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.statut := 'pending';
    NEW.admin_notes := NULL;
    NEW.date_debut := NULL;
    NEW.date_fin := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.statut IS DISTINCT FROM OLD.statut THEN
      RAISE EXCEPTION 'Not allowed to change status';
    END IF;
    IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
      RAISE EXCEPTION 'Not allowed to change admin notes';
    END IF;
    IF NEW.date_debut IS DISTINCT FROM OLD.date_debut OR NEW.date_fin IS DISTINCT FROM OLD.date_fin THEN
      RAISE EXCEPTION 'Not allowed to change broadcast dates';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Not allowed to change owner';
    END IF;
    IF OLD.statut <> 'pending' THEN
      RAISE EXCEPTION 'Campaign is locked after moderation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_publicites_guard
  BEFORE INSERT OR UPDATE ON public.publicites
  FOR EACH ROW EXECUTE FUNCTION public.publicites_guard_owner_changes();

CREATE TRIGGER trg_publicites_updated
  BEFORE UPDATE ON public.publicites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();