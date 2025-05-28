export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_contacts: {
        Row: {
          contact_type: string
          contact_value: string
          created_at: string | null
          customer_id: string | null
          id: string
          is_primary: boolean | null
        }
        Insert: {
          contact_type: string
          contact_value: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          contact_type?: string
          contact_value?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          birth_date: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          birth_date?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          birth_date?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_alerts: {
        Row: {
          active: boolean
          alert_threshold_days: number | null
          alert_threshold_km: number | null
          created_at: string
          description: string | null
          id: string
          km_interval: number | null
          last_service_date: string | null
          last_service_km: number | null
          next_service_due_date: string | null
          next_service_due_km: number | null
          service_type: string
          shop_id: string
          time_interval_days: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          active?: boolean
          alert_threshold_days?: number | null
          alert_threshold_km?: number | null
          created_at?: string
          description?: string | null
          id?: string
          km_interval?: number | null
          last_service_date?: string | null
          last_service_km?: number | null
          next_service_due_date?: string | null
          next_service_due_km?: number | null
          service_type: string
          shop_id: string
          time_interval_days?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          active?: boolean
          alert_threshold_days?: number | null
          alert_threshold_km?: number | null
          created_at?: string
          description?: string | null
          id?: string
          km_interval?: number | null
          last_service_date?: string | null
          last_service_km?: number | null
          next_service_due_date?: string | null
          next_service_due_km?: number | null
          service_type?: string
          shop_id?: string
          time_interval_days?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_alerts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          delivery_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_id: string
          processed_at: string | null
          recipient: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          delivery_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id: string
          processed_at?: string | null
          recipient?: string | null
          sent_at?: string | null
          status: string
        }
        Update: {
          delivery_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string
          processed_at?: string | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          notification_type: string
          shop_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          notification_type: string
          shop_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          notification_type?: string
          shop_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          link: string | null
          metadata: Json | null
          priority: string
          read: boolean
          read_at: string | null
          shop_id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          priority?: string
          read?: boolean
          read_at?: string | null
          shop_id: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          link?: string | null
          metadata?: Json | null
          priority?: string
          read?: boolean
          read_at?: string | null
          shop_id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          item_type: string
          quantity: number
          service_order_id: string
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          item_type: string
          quantity?: number
          service_order_id: string
          total_price?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          item_type?: string
          quantity?: number
          service_order_id?: string
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_status_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          id: string
          service_order_id: string
          status: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          service_order_id: string
          status: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          service_order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_status_history_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string | null
          estimated_completion_date: string | null
          id: string
          order_number: number
          shop_id: string
          status: string
          technician_notes: string | null
          total_amount: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description?: string | null
          estimated_completion_date?: string | null
          id?: string
          order_number?: number
          shop_id: string
          status?: string
          technician_notes?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string | null
          estimated_completion_date?: string | null
          id?: string
          order_number?: number
          shop_id?: string
          status?: string
          technician_notes?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_users: {
        Row: {
          joined_at: string | null
          role: string
          shop_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          role?: string
          shop_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          joined_at?: string | null
          role?: string
          shop_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_users_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          status: string | null
          subscription_plan_id: string | null
          theme_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          status?: string | null
          subscription_plan_id?: string | null
          theme_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          status?: string | null
          subscription_plan_id?: string | null
          theme_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_public: boolean | null
          limits: Json | null
          name: string
          price_monthly: number
          price_yearly: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_public?: boolean | null
          limits?: Json | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_public?: boolean | null
          limits?: Json | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          end_date: string | null
          id: string
          next_billing_date: string | null
          plan_id: string | null
          shop_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          plan_id?: string | null
          shop_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          plan_id?: string | null
          shop_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_maintenance_alerts: {
        Row: {
          alert_type: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          target_date: string | null
          target_mileage: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          alert_type: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_mileage?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          alert_type?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_date?: string | null
          target_mileage?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string | null
          customer_id: string | null
          engine_type: string | null
          fuel_type: string | null
          id: string
          images: Json | null
          license_plate: string | null
          make: string
          mileage: number | null
          model: string
          notes: string | null
          shop_id: string | null
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          customer_id?: string | null
          engine_type?: string | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          license_plate?: string | null
          make: string
          mileage?: number | null
          model: string
          notes?: string | null
          shop_id?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          customer_id?: string | null
          engine_type?: string | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          license_plate?: string | null
          make?: string
          mileage?: number | null
          model?: string
          notes?: string | null
          shop_id?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification_secure: {
        Args: {
          p_shop_id: string
          p_user_id: string
          p_title: string
          p_content: string
          p_type: string
          p_priority?: string
          p_link?: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
