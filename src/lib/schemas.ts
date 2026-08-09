import { z } from "zod";

export const emailSchema = z.string().trim().email("Email invalide").max(255);
export const phoneSchema = z.string().trim().min(5, "Téléphone invalide").max(30);

export const typeProfilSchema = z.enum(["agriculteur", "etudiant", "investisseur", "cadre", "annonceur"]);

// ---- Annonceur (entreprise / marque) ----
export const annonceurDetailsSchema = z.object({
  entreprise: z.string().trim().min(2, "Nom de l'entreprise requis").max(160),
  responsable: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  telephone: z.string().trim().max(30).optional().default(""),
  secteur_activite: z.string().trim().max(120).optional().default(""),
  localisation: z.string().trim().max(160).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  logo_url: z.string().trim().max(1000).optional().default(""),
  site_web: z
    .string()
    .trim()
    .max(300)
    .regex(/^https:\/\/[^\s]+$/i, "L'URL doit commencer par https://")
    .optional()
    .or(z.literal("")),
  infos_complementaires: z.string().trim().max(2000).optional().default(""),
});

// ---- Publicités ----
export const pubPlacementSchema = z.enum(["banner", "card", "video", "feed"]);
export const pubMediaSchema = z.enum(["image", "video"]);

export const publiciteSchema = z.object({
  titre: z.string().trim().min(3, "Titre trop court").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  media_type: pubMediaSchema.default("image"),
  media_url: z.string().trim().min(1, "Visuel requis").max(2000),
  media_path: z.string().trim().max(500).optional().or(z.literal("")),
  placement: pubPlacementSchema.default("card"),
  lien_url: z
    .string()
    .trim()
    .max(300)
    .regex(/^https:\/\/[^\s]+$/i, "L'URL doit commencer par https://")
    .optional()
    .or(z.literal("")),
  contact_nom: z.string().trim().max(120).optional().or(z.literal("")),
  contact_email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  contact_telephone: z.string().trim().max(30).optional().or(z.literal("")),
  periode_souhaitee_debut: z.string().trim().max(20).optional().or(z.literal("")),
  periode_souhaitee_fin: z.string().trim().max(20).optional().or(z.literal("")),
});

export const registerSchema = z.object({
  prenom: z.string().trim().min(2).max(80),
  nom: z.string().trim().min(2).max(80),
  email: emailSchema,
  telephone: phoneSchema,
  password: z.string().min(8, "8 caractères minimum").max(72),
  type_profil: typeProfilSchema,
  region: z.string().trim().max(80).optional().default(""),
  commune: z.string().trim().max(80).optional().default(""),
});

// Champs professionnels enrichis (Investisseurs & Cadres)
export const proDetailsSchema = z.object({
  profession: z.string().trim().max(120).optional().default(""),
  organisation: z.string().trim().max(160).optional().default(""),
  fonction: z.string().trim().max(120).optional().default(""),
  secteur_activite: z.string().trim().max(120).optional().default(""),
  pays: z.string().trim().max(80).optional().default(""),
  ville: z.string().trim().max(80).optional().default(""),
  capacite_investissement: z.string().trim().max(120).optional().default(""),
  domaine_interet: z.string().trim().max(200).optional().default(""),
  experience: z.string().trim().max(1000).optional().default(""),
});

export const contactSchema = z.object({
  nom: z.string().trim().min(2).max(200),
  telephone: z.string().trim().min(5).max(30).optional().or(z.literal("")),
  email: emailSchema,
  sujet: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(5000),
  hp: z.string().max(0).optional(), // honeypot
});

export const rendezVousSchema = z.object({
  nom: z.string().trim().min(2).max(200),
  email: emailSchema,
  telephone: phoneSchema,
  profil: z.string().trim().max(80).optional().or(z.literal("")),
  date_souhaitee: z.string().min(4),
  heure_souhaitee: z.string().min(3).max(20),
  lieu: z.string().trim().max(200).optional().or(z.literal("")),
  mode: z.enum(["presentiel", "visio", "whatsapp"]).default("presentiel"),
  objet: z.string().trim().min(2).max(200),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  annonce_id: z.string().uuid().optional(),
  hp: z.string().max(0).optional(),
});

export const annonceSchema = z.object({
  titre: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  categorie: z.string().trim().max(80).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  pieces_jointes: z.array(z.object({ url: z.string(), name: z.string(), size: z.number(), type: z.string() })).default([]),
});

export const profileUpdateSchema = z.object({
  prenom: z.string().trim().min(2).max(80),
  nom: z.string().trim().min(2).max(80),
  telephone: phoneSchema,
  region: z.string().trim().max(80).optional().or(z.literal("")),
  commune: z.string().trim().max(80).optional().or(z.literal("")),
  adresse: z.string().trim().max(300).optional().or(z.literal("")),
  bio: z.string().trim().max(1500).optional().or(z.literal("")),
  avatar_url: z.string().max(500).optional().or(z.literal("")),
});
