-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.type_profil AS ENUM ('agriculteur', 'etudiant', 'investisseur');
CREATE TYPE public.user_statut AS ENUM ('active', 'suspended');
CREATE TYPE public.annonce_statut AS ENUM ('pending', 'validated', 'rejected', 'archived');
CREATE TYPE public.rdv_statut AS ENUM ('pending', 'planifie', 'termine', 'annule');
CREATE TYPE public.rdv_mode AS ENUM ('presentiel', 'visio', 'whatsapp');

-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  prenom TEXT,
  nom TEXT,
  telephone TEXT,
  avatar_url TEXT,
  type_profil public.type_profil,
  adresse TEXT,
  region TEXT,
  commune TEXT,
  bio TEXT,
  statut public.user_statut NOT NULL DEFAULT 'active',
  derniere_connexion TIMESTAMPTZ,
  nb_connexions INTEGER NOT NULL DEFAULT 0,
  last_ip TEXT,
  last_user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Profiles policies
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ PROFIL DETAILS ============
CREATE TABLE public.agriculteur_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_ha NUMERIC,
  cultures TEXT,
  type_exploitation TEXT,
  annees_experience INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agriculteur_details TO authenticated;
GRANT ALL ON public.agriculteur_details TO service_role;
ALTER TABLE public.agriculteur_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agri_self" ON public.agriculteur_details FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.etudiant_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ecole TEXT,
  filiere TEXT,
  niveau TEXT,
  domaine_interet TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etudiant_details TO authenticated;
GRANT ALL ON public.etudiant_details TO service_role;
ALTER TABLE public.etudiant_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "etud_self" ON public.etudiant_details FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.investisseur_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  capacite_investissement TEXT,
  secteurs_interet TEXT,
  organisation TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investisseur_details TO authenticated;
GRANT ALL ON public.investisseur_details TO service_role;
ALTER TABLE public.investisseur_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_self" ON public.investisseur_details FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ ANNONCES ============
CREATE TABLE public.annonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  categorie TEXT,
  budget TEXT,
  region TEXT,
  pieces_jointes JSONB NOT NULL DEFAULT '[]'::jsonb,
  statut public.annonce_statut NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.annonces TO authenticated;
GRANT ALL ON public.annonces TO service_role;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_annonces_updated BEFORE UPDATE ON public.annonces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "annonces_owner_select" ON public.annonces FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "annonces_owner_insert" ON public.annonces FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "annonces_owner_update" ON public.annonces FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "annonces_owner_delete" ON public.annonces FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.annonce_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id UUID NOT NULL REFERENCES public.annonces(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.annonce_history TO authenticated;
GRANT ALL ON public.annonce_history TO service_role;
ALTER TABLE public.annonce_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "annonce_history_admin" ON public.annonce_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ RENDEZ-VOUS ============
CREATE TABLE public.rendez_vous (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  annonce_id UUID REFERENCES public.annonces(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  profil TEXT,
  date_souhaitee DATE NOT NULL,
  heure_souhaitee TEXT NOT NULL,
  lieu TEXT,
  mode public.rdv_mode NOT NULL DEFAULT 'presentiel',
  objet TEXT NOT NULL,
  description TEXT,
  statut public.rdv_statut NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rendez_vous TO authenticated;
GRANT INSERT ON public.rendez_vous TO anon;
GRANT ALL ON public.rendez_vous TO service_role;
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_rdv_updated BEFORE UPDATE ON public.rendez_vous
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "rdv_public_insert" ON public.rendez_vous FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "rdv_owner_select" ON public.rendez_vous FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "rdv_admin_update" ON public.rendez_vous FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "rdv_admin_delete" ON public.rendez_vous FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ CONTACTS ============
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT NOT NULL,
  sujet TEXT NOT NULL,
  message TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_public_insert" ON public.contacts FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "contacts_admin_all" ON public.contacts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contacts_admin_update" ON public.contacts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contacts_admin_delete" ON public.contacts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PARTENAIRES ============
CREATE TABLE public.partenaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  logo_url TEXT,
  url TEXT,
  description TEXT,
  ordre INTEGER NOT NULL DEFAULT 0,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partenaires TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partenaires TO authenticated;
GRANT ALL ON public.partenaires TO service_role;
ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_partenaires_updated BEFORE UPDATE ON public.partenaires
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "partenaires_public_read" ON public.partenaires FOR SELECT TO anon, authenticated
  USING (actif = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "partenaires_admin_write" ON public.partenaires FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "partenaires_admin_update" ON public.partenaires FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "partenaires_admin_delete" ON public.partenaires FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ ACTIVITY LOG ============
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_self_or_admin" ON public.activity_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_activity_user_created ON public.activity_log (user_id, created_at DESC);
CREATE INDEX idx_activity_created ON public.activity_log (created_at DESC);

-- ============ ADMIN AUDIT LOG ============
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_admin_only" ON public.admin_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_admin_audit_created ON public.admin_audit_log (created_at DESC);

-- ============ HANDLE NEW USER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_type public.type_profil;
BEGIN
  BEGIN
    v_type := (NEW.raw_user_meta_data->>'type_profil')::public.type_profil;
  EXCEPTION WHEN OTHERS THEN
    v_type := NULL;
  END;

  INSERT INTO public.profiles (id, email, prenom, nom, telephone, type_profil, region, commune)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'prenom',
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'telephone',
    v_type,
    NEW.raw_user_meta_data->>'region',
    NEW.raw_user_meta_data->>'commune'
  );

  -- Toujours role 'user' (jamais admin par un endpoint public)
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.activity_log (user_id, action, metadata)
  VALUES (NEW.id, 'register', jsonb_build_object('email', NEW.email));

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PARTENAIRES SEEDS ============
INSERT INTO public.partenaires (nom, description, ordre) VALUES
  ('Ministère de l''Agriculture', 'Institution partenaire de référence pour le secteur agricole sénégalais.', 1),
  ('ISRA', 'Institut sénégalais de recherches agricoles.', 2),
  ('ANCAR', 'Agence nationale de conseil agricole et rural.', 3);