
-- 1) annonces: force statut='pending' on insert, block statut/admin_notes changes on update for non-admin
DROP POLICY IF EXISTS annonces_owner_insert ON public.annonces;
CREATE POLICY annonces_owner_insert ON public.annonces
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (statut = 'pending' OR public.has_role(auth.uid(), 'admin'))
    AND (admin_notes IS NULL OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS annonces_owner_update ON public.annonces;
CREATE POLICY annonces_owner_update ON public.annonces
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (
      auth.uid() = user_id
      AND statut = (SELECT statut FROM public.annonces WHERE id = public.annonces.id)
      AND admin_notes IS NOT DISTINCT FROM (SELECT admin_notes FROM public.annonces WHERE id = public.annonces.id)
    )
  );

-- 2) profiles: prevent self-updating 'statut'
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (
      auth.uid() = id
      AND statut = (SELECT statut FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 3) public visibility of validated annonces
DROP POLICY IF EXISTS annonces_public_read_validated ON public.annonces;
CREATE POLICY annonces_public_read_validated ON public.annonces
  FOR SELECT TO anon, authenticated
  USING (statut = 'validated');

GRANT SELECT ON public.annonces TO anon;
