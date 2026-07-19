export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip: string | null
          metadata: Json
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      agriculteur_details: {
        Row: {
          annees_experience: number | null
          cultures: string | null
          surface_ha: number | null
          type_exploitation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annees_experience?: number | null
          cultures?: string | null
          surface_ha?: number | null
          type_exploitation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annees_experience?: number | null
          cultures?: string | null
          surface_ha?: number | null
          type_exploitation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      annonce_history: {
        Row: {
          action: string
          admin_id: string | null
          annonce_id: string
          created_at: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          annonce_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          annonce_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "annonce_history_annonce_id_fkey"
            columns: ["annonce_id"]
            isOneToOne: false
            referencedRelation: "annonces"
            referencedColumns: ["id"]
          },
        ]
      }
      annonces: {
        Row: {
          admin_notes: string | null
          budget: string | null
          categorie: string | null
          created_at: string
          description: string
          id: string
          pieces_jointes: Json
          region: string | null
          statut: Database["public"]["Enums"]["annonce_statut"]
          titre: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          categorie?: string | null
          created_at?: string
          description: string
          id?: string
          pieces_jointes?: Json
          region?: string | null
          statut?: Database["public"]["Enums"]["annonce_statut"]
          titre: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          categorie?: string | null
          created_at?: string
          description?: string
          id?: string
          pieces_jointes?: Json
          region?: string | null
          statut?: Database["public"]["Enums"]["annonce_statut"]
          titre?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          nom: string
          statut: string
          sujet: string
          telephone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          nom: string
          statut?: string
          sujet: string
          telephone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          nom?: string
          statut?: string
          sujet?: string
          telephone?: string | null
        }
        Relationships: []
      }
      etudiant_details: {
        Row: {
          domaine_interet: string | null
          ecole: string | null
          filiere: string | null
          niveau: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          domaine_interet?: string | null
          ecole?: string | null
          filiere?: string | null
          niveau?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          domaine_interet?: string | null
          ecole?: string | null
          filiere?: string | null
          niveau?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investisseur_details: {
        Row: {
          capacite_investissement: string | null
          domaine_interet: string | null
          experience: string | null
          fonction: string | null
          organisation: string | null
          pays: string | null
          profession: string | null
          secteur_activite: string | null
          secteurs_interet: string | null
          updated_at: string
          user_id: string
          ville: string | null
        }
        Insert: {
          capacite_investissement?: string | null
          domaine_interet?: string | null
          experience?: string | null
          fonction?: string | null
          organisation?: string | null
          pays?: string | null
          profession?: string | null
          secteur_activite?: string | null
          secteurs_interet?: string | null
          updated_at?: string
          user_id: string
          ville?: string | null
        }
        Update: {
          capacite_investissement?: string | null
          domaine_interet?: string | null
          experience?: string | null
          fonction?: string | null
          organisation?: string | null
          pays?: string | null
          profession?: string | null
          secteur_activite?: string | null
          secteurs_interet?: string | null
          updated_at?: string
          user_id?: string
          ville?: string | null
        }
        Relationships: []
      }
      partenaires: {
        Row: {
          actif: boolean
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          nom: string
          ordre: number
          updated_at: string
          url: string | null
        }
        Insert: {
          actif?: boolean
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          ordre?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          actif?: boolean
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          ordre?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adresse: string | null
          avatar_url: string | null
          bio: string | null
          commune: string | null
          created_at: string
          derniere_connexion: string | null
          email: string | null
          id: string
          last_ip: string | null
          last_user_agent: string | null
          nb_connexions: number
          nom: string | null
          prenom: string | null
          region: string | null
          statut: Database["public"]["Enums"]["user_statut"]
          telephone: string | null
          type_profil: Database["public"]["Enums"]["type_profil"] | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          avatar_url?: string | null
          bio?: string | null
          commune?: string | null
          created_at?: string
          derniere_connexion?: string | null
          email?: string | null
          id: string
          last_ip?: string | null
          last_user_agent?: string | null
          nb_connexions?: number
          nom?: string | null
          prenom?: string | null
          region?: string | null
          statut?: Database["public"]["Enums"]["user_statut"]
          telephone?: string | null
          type_profil?: Database["public"]["Enums"]["type_profil"] | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          avatar_url?: string | null
          bio?: string | null
          commune?: string | null
          created_at?: string
          derniere_connexion?: string | null
          email?: string | null
          id?: string
          last_ip?: string | null
          last_user_agent?: string | null
          nb_connexions?: number
          nom?: string | null
          prenom?: string | null
          region?: string | null
          statut?: Database["public"]["Enums"]["user_statut"]
          telephone?: string | null
          type_profil?: Database["public"]["Enums"]["type_profil"] | null
          updated_at?: string
        }
        Relationships: []
      }
      rendez_vous: {
        Row: {
          admin_notes: string | null
          annonce_id: string | null
          created_at: string
          date_souhaitee: string
          description: string | null
          email: string
          heure_souhaitee: string
          id: string
          lieu: string | null
          mode: Database["public"]["Enums"]["rdv_mode"]
          nom: string
          objet: string
          profil: string | null
          statut: Database["public"]["Enums"]["rdv_statut"]
          telephone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          annonce_id?: string | null
          created_at?: string
          date_souhaitee: string
          description?: string | null
          email: string
          heure_souhaitee: string
          id?: string
          lieu?: string | null
          mode?: Database["public"]["Enums"]["rdv_mode"]
          nom: string
          objet: string
          profil?: string | null
          statut?: Database["public"]["Enums"]["rdv_statut"]
          telephone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          annonce_id?: string | null
          created_at?: string
          date_souhaitee?: string
          description?: string | null
          email?: string
          heure_souhaitee?: string
          id?: string
          lieu?: string | null
          mode?: Database["public"]["Enums"]["rdv_mode"]
          nom?: string
          objet?: string
          profil?: string | null
          statut?: Database["public"]["Enums"]["rdv_statut"]
          telephone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rendez_vous_annonce_id_fkey"
            columns: ["annonce_id"]
            isOneToOne: false
            referencedRelation: "annonces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      annonce_statut: "pending" | "validated" | "rejected" | "archived"
      app_role: "admin" | "user"
      rdv_mode: "presentiel" | "visio" | "whatsapp"
      rdv_statut: "pending" | "planifie" | "termine" | "annule"
      type_profil: "agriculteur" | "etudiant" | "investisseur" | "cadre"
      user_statut: "active" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      annonce_statut: ["pending", "validated", "rejected", "archived"],
      app_role: ["admin", "user"],
      rdv_mode: ["presentiel", "visio", "whatsapp"],
      rdv_statut: ["pending", "planifie", "termine", "annule"],
      type_profil: ["agriculteur", "etudiant", "investisseur", "cadre"],
      user_statut: ["active", "suspended"],
    },
  },
} as const
