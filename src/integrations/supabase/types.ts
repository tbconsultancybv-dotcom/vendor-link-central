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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_suppliers: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          reason: string | null
          supplier_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          reason?: string | null
          supplier_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          reason?: string | null
          supplier_id?: string
        }
        Relationships: []
      }
      contract_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          category_id: string | null
          contact_email: string | null
          contact_phone: string | null
          contract_value: number | null
          created_at: string
          data_visibility_level: number | null
          decision_at: string | null
          department: string | null
          description: string | null
          device_count: number | null
          division: string | null
          end_date: string
          id: string
          is_on_marketplace: boolean | null
          marketplace_date: string | null
          max_suppliers: number | null
          monthly_cost: number | null
          name: string
          notes: string | null
          open_to_offers: string | null
          renewal_period_months: number | null
          responsible_name: string | null
          silent_renewal: boolean | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"] | null
          supplier_name: string
          termination_period_days: number | null
          updated_at: string
          user_decision: string | null
          user_id: string
          variable_costs: string | null
          yearly_cost: number | null
        }
        Insert: {
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_value?: number | null
          created_at?: string
          data_visibility_level?: number | null
          decision_at?: string | null
          department?: string | null
          description?: string | null
          device_count?: number | null
          division?: string | null
          end_date: string
          id?: string
          is_on_marketplace?: boolean | null
          marketplace_date?: string | null
          max_suppliers?: number | null
          monthly_cost?: number | null
          name: string
          notes?: string | null
          open_to_offers?: string | null
          renewal_period_months?: number | null
          responsible_name?: string | null
          silent_renewal?: boolean | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          supplier_name: string
          termination_period_days?: number | null
          updated_at?: string
          user_decision?: string | null
          user_id: string
          variable_costs?: string | null
          yearly_cost?: number | null
        }
        Update: {
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contract_value?: number | null
          created_at?: string
          data_visibility_level?: number | null
          decision_at?: string | null
          department?: string | null
          description?: string | null
          device_count?: number | null
          division?: string | null
          end_date?: string
          id?: string
          is_on_marketplace?: boolean | null
          marketplace_date?: string | null
          max_suppliers?: number | null
          monthly_cost?: number | null
          name?: string
          notes?: string | null
          open_to_offers?: string | null
          renewal_period_months?: number | null
          responsible_name?: string | null
          silent_renewal?: boolean | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          supplier_name?: string
          termination_period_days?: number | null
          updated_at?: string
          user_decision?: string | null
          user_id?: string
          variable_costs?: string | null
          yearly_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "contract_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketplace_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          contract_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_linked: boolean | null
          ocr_data: Json | null
          ocr_processed: boolean | null
          source: string | null
          suggested_contract_id: string | null
          user_id: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_linked?: boolean | null
          ocr_data?: Json | null
          ocr_processed?: boolean | null
          source?: string | null
          suggested_contract_id?: string | null
          user_id: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_linked?: boolean | null
          ocr_data?: Json | null
          ocr_processed?: boolean | null
          source?: string | null
          suggested_contract_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_suggested_contract_id_fkey"
            columns: ["suggested_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_leads: {
        Row: {
          claimed_at: string | null
          completed_at: string | null
          contract_id: string
          created_at: string
          credits_cost: number
          customer_credits_paid: number | null
          customer_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          supplier_credits_paid: number | null
          supplier_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          completed_at?: string | null
          contract_id: string
          created_at?: string
          credits_cost?: number
          customer_credits_paid?: number | null
          customer_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          supplier_credits_paid?: number | null
          supplier_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          completed_at?: string | null
          contract_id?: string
          created_at?: string
          credits_cost?: number
          customer_credits_paid?: number | null
          customer_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          supplier_credits_paid?: number | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_leads_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          contract_id: string | null
          created_at: string
          due_date: string | null
          id: string
          is_actioned: boolean | null
          is_read: boolean | null
          message: string
          priority: Database["public"]["Enums"]["notification_priority"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          contract_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_actioned?: boolean | null
          is_read?: boolean | null
          message: string
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          contract_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_actioned?: boolean | null
          is_read?: boolean | null
          message?: string
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_number: string | null
          address_street: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          credits: number | null
          email: string
          full_name: string | null
          id: string
          is_supplier: boolean | null
          ocr_enabled: boolean
          phone: string | null
          postal_code: string | null
          province: string | null
          sector: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_number?: string | null
          address_street?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          credits?: number | null
          email: string
          full_name?: string | null
          id?: string
          is_supplier?: boolean | null
          ocr_enabled?: boolean
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          sector?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_number?: string | null
          address_street?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          credits?: number | null
          email?: string
          full_name?: string | null
          id?: string
          is_supplier?: boolean | null
          ocr_enabled?: boolean
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          sector?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_appointments: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          lead_id: string
          location: string | null
          meeting_link: string | null
          meeting_type: string | null
          notes: string | null
          scheduled_date: string
          status: string | null
          supplier_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          lead_id: string
          location?: string | null
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          scheduled_date: string
          status?: string | null
          supplier_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          lead_id?: string
          location?: string | null
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          scheduled_date?: string
          status?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketplace_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_ratings: {
        Row: {
          communication_rating: number | null
          created_at: string
          customer_id: string
          id: string
          lead_id: string | null
          overall_rating: number | null
          review: string | null
          service_rating: number | null
          supplier_id: string
        }
        Insert: {
          communication_rating?: number | null
          created_at?: string
          customer_id: string
          id?: string
          lead_id?: string | null
          overall_rating?: number | null
          review?: string | null
          service_rating?: number | null
          supplier_id: string
        }
        Update: {
          communication_rating?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          lead_id?: string | null
          overall_rating?: number | null
          review?: string | null
          service_rating?: number | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "marketplace_leads"
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
      calculate_contract_status: {
        Args: { p_end_date: string; p_termination_period_days: number }
        Returns: Database["public"]["Enums"]["contract_status"]
      }
      calculate_lead_credits: {
        Args: { p_data_visibility: number; p_max_suppliers: number }
        Returns: number
      }
      get_lead_documents: {
        Args: { _lead_id: string }
        Returns: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          uploaded_at: string
        }[]
      }
      get_my_claimed_leads: {
        Args: never
        Returns: {
          category_color: string
          category_icon: string
          category_id: string
          category_name: string
          claimed_at: string
          contact_email: string
          contact_phone: string
          contract_id: string
          contract_name: string
          contract_notes: string
          contract_value: number
          created_at: string
          credits_cost: number
          customer_company_name: string
          customer_email: string
          customer_full_name: string
          customer_id: string
          customer_phone: string
          customer_province: string
          customer_sector: string
          data_visibility_level: number
          description: string
          device_count: number
          end_date: string
          lead_id: string
          max_suppliers: number
          monthly_cost: number
          notes: string
          responsible_name: string
          start_date: string
          status: Database["public"]["Enums"]["lead_status"]
          supplier_name: string
          yearly_cost: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_supplier: { Args: { _user_id: string }; Returns: boolean }
      list_marketplace_listings: {
        Args: never
        Returns: {
          category_color: string
          category_icon: string
          category_id: string
          category_name: string
          claimed_at: string
          contract_id: string
          created_at: string
          credits_cost: number
          data_visibility_level: number
          device_count: number
          end_date: string
          lead_id: string
          province: string
          sector: string
          status: Database["public"]["Enums"]["lead_status"]
          supplier_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "viewer" | "finance"
      contract_status:
        | "active"
        | "expiring"
        | "expired"
        | "terminated"
        | "draft"
      lead_status:
        | "open"
        | "claimed"
        | "in_progress"
        | "completed"
        | "cancelled"
      notification_priority: "low" | "medium" | "high" | "critical"
      notification_type:
        | "expiry_warning"
        | "action_required"
        | "lead_update"
        | "system"
        | "document_received"
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
      app_role: ["admin", "manager", "viewer", "finance"],
      contract_status: ["active", "expiring", "expired", "terminated", "draft"],
      lead_status: ["open", "claimed", "in_progress", "completed", "cancelled"],
      notification_priority: ["low", "medium", "high", "critical"],
      notification_type: [
        "expiry_warning",
        "action_required",
        "lead_update",
        "system",
        "document_received",
      ],
    },
  },
} as const
