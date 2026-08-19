DROP POLICY IF EXISTS annonces_public_read_validated ON public.annonces;
REVOKE SELECT ON public.annonces FROM anon;