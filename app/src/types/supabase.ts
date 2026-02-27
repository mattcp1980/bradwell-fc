export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      fixtures: {
        Row: {
          id: string
          date: string
          opponent: string
          home: boolean
          venue: string | null
          result: Json | null
          competition: string | null
        }
        Insert: {
          id?: string
          date: string
          opponent: string
          home?: boolean
          venue?: string | null
          result?: Json | null
          competition?: string | null
        }
        Update: {
          id?: string
          date?: string
          opponent?: string
          home?: boolean
          venue?: string | null
          result?: Json | null
          competition?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          audience: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          audience: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          audience?: string
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      club_officials: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_primary_contact: boolean
          mobile: string
          role: string
          teams: string[]
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_primary_contact?: boolean
          mobile: string
          role: string
          teams?: string[]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_primary_contact?: boolean
          mobile?: string
          role?: string
          teams?: string[]
        }
        Relationships: []
      }
      documents: {
        Row: {
          audience: string
          category: string
          created_at: string
          file_path: string
          file_url: string
          id: string
          name: string
          uploaded_by: string
        }
        Insert: {
          audience: string
          category?: string
          created_at?: string
          file_path: string
          file_url: string
          id?: string
          name: string
          uploaded_by: string
        }
        Update: {
          audience?: string
          category?: string
          created_at?: string
          file_path?: string
          file_url?: string
          id?: string
          name?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string
          end_time: string | null
          event_date: string
          id: string
          location: string
          required_attendance: boolean
          start_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          end_time?: string | null
          event_date: string
          id?: string
          location?: string
          required_attendance?: boolean
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          end_time?: string | null
          event_date?: string
          id?: string
          location?: string
          required_attendance?: boolean
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_id: string
          body: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          images: string[]
          post_to_facebook: boolean
          scheduled_at: string | null
          status: Database["public"]["Enums"]["news_post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          images?: string[]
          post_to_facebook?: boolean
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["news_post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          images?: string[]
          post_to_facebook?: boolean
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["news_post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          scope: Json
          sent_by: string
          sent_count: number
          subject: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          scope: Json
          sent_by: string
          sent_count?: number
          subject: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          scope?: Json
          sent_by?: string
          sent_count?: number
          subject?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          age_group: string
          created_at: string
          id: string
          name: string
          primary_contact_id: string | null
        }
        Insert: {
          age_group: string
          created_at?: string
          id?: string
          name: string
          primary_contact_id?: string | null
        }
        Update: {
          age_group?: string
          created_at?: string
          id?: string
          name?: string
          primary_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "club_officials"
            referencedColumns: ["id"]
          },
        ]
      }
      training_schedules: {
        Row: {
          created_at: string
          id: string
          name: string
          pitch_image_path: string | null
          pitch_image_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          pitch_image_path?: string | null
          pitch_image_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pitch_image_path?: string | null
          pitch_image_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_slots: {
        Row: {
          created_at: string
          day: string
          end_time: string
          id: string
          schedule_id: string
          start_time: string
          team_id: string | null
          venue: string
        }
        Insert: {
          created_at?: string
          day: string
          end_time: string
          id?: string
          schedule_id: string
          start_time: string
          team_id?: string | null
          venue?: string
        }
        Update: {
          created_at?: string
          day?: string
          end_time?: string
          id?: string
          schedule_id?: string
          start_time?: string
          team_id?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_slots_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "training_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_slots_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      news_post_status: "draft" | "published" | "scheduled"
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

export type UserRole = 'coach' | 'admin'

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      news_post_status: ["draft", "published", "scheduled"],
    },
  },
} as const

