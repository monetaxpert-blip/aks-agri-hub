-- 1) Remplacer les politiques auto-référentielles vulnérables sur annonces
DROP POLICY IF EXISTS annonces_owner_update ON public.annonces;
DROP POLICY IF EXISTS annonces_owner_insert ON public.annonces;

CREATE POLICY annonces_owner_update ON public.annonces
FOR UPDATE TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY annonces_owner_insert ON public.annonces
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2) Politique profiles sans sous-requête auto-référentielle
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;

CREATE POLICY profiles_self_update ON public.profiles
FOR UPDATE TO authenticated
USING ((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK ((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'));

-- 3) Helper : compte suspendu ?
CREATE OR REPLACE FUNCTION public.is_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND statut = 'suspended');
$$;

-- 4) Trigger annonces : OLD/NEW explicites
CREATE OR REPLACE FUNCTION public.annonces_guard_owner_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean := public.has_role(auth.uid(), 'admin');
BEGIN
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NOT NULL AND public.is_suspended(auth.uid()) THEN
    RAISE EXCEPTION 'Compte suspendu : action interdite';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.user_id := COALESCE(auth.uid(), NEW.user_id);
    NEW.statut := 'pending';
    NEW.admin_notes := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.statut IS DISTINCT FROM OLD.statut THEN
      RAISE EXCEPTION 'Modification du statut interdite';
    END IF;
    IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
      RAISE EXCEPTION 'Modification des notes administrateur interdite';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Transfert de propriete interdit';
    END IF;
    IF OLD.statut <> 'pending' THEN
      RAISE EXCEPTION 'Annonce verrouillee apres moderation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5) Trigger profiles : OLD/NEW explicites
CREATE OR REPLACE FUNCTION public.profiles_guard_owner_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.statut IS DISTINCT FROM OLD.statut THEN
      RAISE EXCEPTION 'Modification du statut de compte interdite';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Modification de l identifiant interdite';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 6) S'assurer que les triggers existent bien
DROP TRIGGER IF EXISTS trg_annonces_guard ON public.annonces;
CREATE TRIGGER trg_annonces_guard
BEFORE INSERT OR UPDATE ON public.annonces
FOR EACH ROW EXECUTE FUNCTION public.annonces_guard_owner_changes();

DROP TRIGGER IF EXISTS trg_profiles_guard ON public.profiles;
CREATE TRIGGER trg_profiles_guard
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_owner_changes();