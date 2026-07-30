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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          lawyer_id: string | null
          lawyer_user_id: string | null
          mode: string
          notes: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          lawyer_id?: string | null
          lawyer_user_id?: string | null
          mode?: string
          notes?: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          lawyer_id?: string | null
          lawyer_user_id?: string | null
          mode?: string
          notes?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assignee_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          lawyer_id: string | null
          owner_id: string
          priority: string
          reference: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          lawyer_id?: string | null
          owner_id: string
          priority?: string
          reference?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          lawyer_id?: string | null
          owner_id?: string
          priority?: string
          reference?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          created_at: string
          description: string
          id: string
          incident_location: string
          reference: string
          station_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          incident_location?: string
          reference?: string
          station_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          incident_location?: string
          reference?: string
          station_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "police_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          counterpart_id: string
          created_at: string
          id: string
          last_message_at: string
          subject: string
        }
        Insert: {
          client_id: string
          counterpart_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          subject?: string
        }
        Update: {
          client_id?: string
          counterpart_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          subject?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string | null
          content_type: string
          created_at: string
          encrypted: boolean
          id: string
          owner_id: string
          size_bytes: number
          storage_path: string
          title: string
          version: number
        }
        Insert: {
          case_id?: string | null
          content_type?: string
          created_at?: string
          encrypted?: boolean
          id?: string
          owner_id: string
          size_bytes?: number
          storage_path: string
          title: string
          version?: number
        }
        Update: {
          case_id?: string | null
          content_type?: string
          created_at?: string
          encrypted?: boolean
          id?: string
          owner_id?: string
          size_bytes?: number
          storage_path?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      judgements: {
        Row: {
          case_number: string
          court: string
          created_at: string
          delivered_on: string | null
          description: string
          document_url: string | null
          id: string
          image_url: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          case_number?: string
          court?: string
          created_at?: string
          delivered_on?: string | null
          description?: string
          document_url?: string | null
          id?: string
          image_url?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          case_number?: string
          court?: string
          created_at?: string
          delivered_on?: string | null
          description?: string
          document_url?: string | null
          id?: string
          image_url?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      lawyers: {
        Row: {
          bio: string
          county: string
          created_at: string
          currency: string
          email: string
          field: string
          firm: string
          full_name: string
          hourly_rate: number
          id: string
          image_url: string | null
          languages: string[]
          phone: string
          rating: number
          review_count: number
          updated_at: string
          user_id: string | null
          verified: boolean
          years_experience: number
        }
        Insert: {
          bio?: string
          county?: string
          created_at?: string
          currency?: string
          email?: string
          field?: string
          firm?: string
          full_name: string
          hourly_rate?: number
          id?: string
          image_url?: string | null
          languages?: string[]
          phone?: string
          rating?: number
          review_count?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          years_experience?: number
        }
        Update: {
          bio?: string
          county?: string
          created_at?: string
          currency?: string
          email?: string
          field?: string
          firm?: string
          full_name?: string
          hourly_rate?: number
          id?: string
          image_url?: string | null
          languages?: string[]
          phone?: string
          rating?: number
          review_count?: number
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          years_experience?: number
        }
        Relationships: []
      }
      legal_advices: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          summary: string
          title: string
        }
        Insert: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          summary?: string
          title: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          summary?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
          type: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
          type?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          image_url: string | null
          kind: string
          title: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          kind?: string
          title: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          kind?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          data: Json
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          channel?: string
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json
          provider: string
          provider_reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          provider?: string
          provider_reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          provider?: string
          provider_reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      police_stations: {
        Row: {
          address: string
          created_at: string
          district: string
          email: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string
        }
        Insert: {
          address?: string
          created_at?: string
          district?: string
          email?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string
        }
        Update: {
          address?: string
          created_at?: string
          district?: string
          email?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          email: string
          full_name: string
          id: string
          location: string
          phone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
          location?: string
          phone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: []
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
      wanted_persons: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          posted_by: string | null
          reward: number
          station: string
          status: string
          suspect_of: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name: string
          posted_by?: string | null
          reward?: number
          station?: string
          status?: string
          suspect_of?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          posted_by?: string | null
          reward?: number
          station?: string
          status?: string
          suspect_of?: string
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
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "lawyer" | "admin" | "police" | "judiciary"
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
      app_role: ["user", "lawyer", "admin", "police", "judiciary"],
    },
  },
} as const
