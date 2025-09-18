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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          attendee_info: Json | null
          booked_at: string | null
          booking_reference: string
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          event_id: string
          expires_at: string | null
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          promotional_code: string | null
          qr_code_data: string | null
          qr_code_url: string | null
          quantity: number
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendee_info?: Json | null
          booked_at?: string | null
          booking_reference: string
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          event_id: string
          expires_at?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          promotional_code?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          quantity?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          unit_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendee_info?: Json | null
          booked_at?: string | null
          booking_reference?: string
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          event_id?: string
          expires_at?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          promotional_code?: string | null
          qr_code_data?: string | null
          qr_code_url?: string | null
          quantity?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_restriction: number | null
          available_seats: number
          base_price: number | null
          booking_end_date: string | null
          booking_start_date: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string
          featured_image_url: string | null
          gallery_urls: string[] | null
          id: string
          is_published: boolean | null
          latitude: number | null
          longitude: number | null
          max_tickets_per_user: number | null
          meta_description: string | null
          organizer_id: string | null
        
          short_description: string | null
          slug: string | null
          social_share_image_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          timezone: string | null
          title: string
          total_capacity: number
          updated_at: string | null
          venue_address: string
          venue_name: string
        }
        Insert: {
          age_restriction?: number | null
          available_seats: number
          base_price?: number | null
          booking_end_date?: string | null
          booking_start_date?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date: string
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_tickets_per_user?: number | null
          meta_description?: string | null
          organizer_id?: string | null
        
          short_description?: string | null
          slug?: string | null
          social_share_image_url?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          total_capacity: number
          updated_at?: string | null
          venue_address: string
          venue_name: string
        }
        Update: {
          age_restriction?: number | null
          available_seats?: number
          base_price?: number | null
          booking_end_date?: string | null
          booking_start_date?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_tickets_per_user?: number | null
          meta_description?: string | null
          organizer_id?: string | null
        
          short_description?: string | null
          slug?: string | null
          social_share_image_url?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          timezone?: string | null
          title?: string
          total_capacity?: number
          updated_at?: string | null
          venue_address?: string
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone_number: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone_number?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone_number?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_profile: {
        Args: {
          user_email: string
          user_full_name: string
          user_id: string
          user_role: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "refunded"
        | "expired"
      event_status: "draft" | "published" | "cancelled" | "completed"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      ticket_status: "valid" | "used" | "cancelled" | "refunded"
      user_role: "attendee" | "organizer" | "admin"
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
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "refunded",
        "expired",
      ],
      event_status: ["draft", "published", "cancelled", "completed"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      ticket_status: ["valid", "used", "cancelled", "refunded"],
      user_role: ["attendee", "organizer", "admin"],
    },
  },
} as const