
-- 1. ANNONCES: prevent self-moderation via trigger + tighten policies
CREATE OR REPLACE FUNCTION public.annonces_guard_owner_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins bypass all checks
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.statut := 'pending';
    NEW.admin_notes := NULL;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Owner cannot change moderation fields
    IF NEW.statut IS DISTINCT FROM OLD.statut THEN
      RAISE EXCEPTION 'Not allowed to change status';
    END IF;
    IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
      RAISE EXCEPTION 'Not allowed to change admin notes';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Not allowed to change owner';
    END IF;
    -- Once moderated, owner cannot edit content
    IF OLD.statut <> 'pending' THEN
      RAISE EXCEPTION 'Annonce is locked after moderation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_annonces_guard ON public.annonces;
CREATE TRIGGER trg_annonces_guard
  BEFORE INSERT OR UPDATE ON public.annonces
  FOR EACH ROW EXECUTE FUNCTION public.annonces_guard_owner_changes();

-- 2. PROFILES: prevent self-suspension-bypass via trigger
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
      RAISE EXCEPTION 'Not allowed to change account status';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Not allowed to change id';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_guard ON public.profiles;
CREATE TRIGGER trg_profiles_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_owner_changes();

-- 3. USER_ROLES: explicitly deny all writes for authenticated users.
-- Only service_role (server functions with supabaseAdmin, and SECURITY DEFINER triggers) can write.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;

-- 4. HAS_ROLE: restrict EXECUTE — policies run as function owner so RLS still works
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
-- Keep for authenticated so app RPC-based admin checks (used server-side) still work
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
