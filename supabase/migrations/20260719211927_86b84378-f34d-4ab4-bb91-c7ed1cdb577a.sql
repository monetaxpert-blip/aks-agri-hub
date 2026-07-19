
-- 1. Add 'cadre' to type_profil enum
ALTER TYPE public.type_profil ADD VALUE IF NOT EXISTS 'cadre';

-- 2. Extend investisseur_details with professional fields (also used by 'cadre' profiles)
ALTER TABLE public.investisseur_details
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS fonction text,
  ADD COLUMN IF NOT EXISTS secteur_activite text,
  ADD COLUMN IF NOT EXISTS pays text,
  ADD COLUMN IF NOT EXISTS ville text,
  ADD COLUMN IF NOT EXISTS domaine_interet text,
  ADD COLUMN IF NOT EXISTS experience text;
