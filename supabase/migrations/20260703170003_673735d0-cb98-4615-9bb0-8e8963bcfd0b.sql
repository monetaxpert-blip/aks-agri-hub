-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke public EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten public-insert policies (validate minimum fields, prevent empty spam)
DROP POLICY IF EXISTS "rdv_public_insert" ON public.rendez_vous;
CREATE POLICY "rdv_public_insert" ON public.rendez_vous FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(nom) BETWEEN 2 AND 200
    AND length(email) BETWEEN 5 AND 200
    AND email LIKE '%@%.%'
    AND length(telephone) BETWEEN 5 AND 30
    AND length(objet) BETWEEN 2 AND 200
  );

DROP POLICY IF EXISTS "contacts_public_insert" ON public.contacts;
CREATE POLICY "contacts_public_insert" ON public.contacts FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(nom) BETWEEN 2 AND 200
    AND length(email) BETWEEN 5 AND 200
    AND email LIKE '%@%.%'
    AND length(sujet) BETWEEN 2 AND 200
    AND length(message) BETWEEN 5 AND 5000
  );