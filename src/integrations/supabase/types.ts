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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      communications_log: {
        Row: {
          communication_type: string
          created_at: string
          created_by: string
          customer_id: string
          direction: string
          id: string
          notes: string | null
          timestamp: string
        }
        Insert: {
          communication_type: string
          created_at?: string
          created_by: string
          customer_id: string
          direction: string
          id?: string
          notes?: string | null
          timestamp?: string
        }
        Update: {
          communication_type?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          direction?: string
          id?: string
          notes?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_log_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notifications: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          email_verified: boolean | null
          id: string
          phone_verified: boolean | null
          sms_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          email_verified?: boolean | null
          id?: string
          phone_verified?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          email_verified?: boolean | null
          id?: string
          phone_verified?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_log: {
        Row: {
          created_at: string
          description: string
          id: string
          logged_at: string
          logged_by: string
          photo_ids: string[] | null
          ticket_id: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          logged_at?: string
          logged_by: string
          photo_ids?: string[] | null
          ticket_id?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          logged_at?: string
          logged_by?: string
          photo_ids?: string[] | null
          ticket_id?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_log_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_log_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          employee_id: string
          hire_date: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          hire_date?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          hire_date?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string
          discount_amount: number
          id: string
          invoice_number: string
          print_url: string | null
          subtotal: number
          tax_amount: number
          ticket_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          discount_amount?: number
          id?: string
          invoice_number: string
          print_url?: string | null
          subtotal?: number
          tax_amount?: number
          ticket_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          discount_amount?: number
          id?: string
          invoice_number?: string
          print_url?: string | null
          subtotal?: number
          tax_amount?: number
          ticket_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      parts: {
        Row: {
          created_at: string
          discount: number
          id: string
          name: string
          part_code: string | null
          quantity: number
          status: string
          tax_percentage: number
          ticket_id: string
          unit_price: number
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          discount?: number
          id?: string
          name: string
          part_code?: string | null
          quantity?: number
          status?: string
          tax_percentage?: number
          ticket_id: string
          unit_price?: number
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          discount?: number
          id?: string
          name?: string
          part_code?: string | null
          quantity?: number
          status?: string
          tax_percentage?: number
          ticket_id?: string
          unit_price?: number
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          campaign_notes: string | null
          city: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          dob_month: number | null
          email: string | null
          employee_id: string | null
          id: string
          invoice_count: number | null
          is_deleted: boolean
          legacy_status: string | null
          name: string
          phone: string | null
          preferred_notification: string | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          campaign_notes?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          dob_month?: number | null
          email?: string | null
          employee_id?: string | null
          id: string
          invoice_count?: number | null
          is_deleted?: boolean
          legacy_status?: string | null
          name: string
          phone?: string | null
          preferred_notification?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          campaign_notes?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          dob_month?: number | null
          email?: string | null
          employee_id?: string | null
          id?: string
          invoice_count?: number | null
          is_deleted?: boolean
          legacy_status?: string | null
          name?: string
          phone?: string | null
          preferred_notification?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      ticket_assignments: {
        Row: {
          admin_id: string
          assigned_at: string
          employee_id: string
          id: string
          is_auto_assigned: boolean
          ticket_id: string
        }
        Insert: {
          admin_id: string
          assigned_at?: string
          employee_id: string
          id?: string
          is_auto_assigned?: boolean
          ticket_id: string
        }
        Update: {
          admin_id?: string
          assigned_at?: string
          employee_id?: string
          id?: string
          is_auto_assigned?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          preferred_pickup_time: string | null
          scheduled_pickup_time: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          updated_at: string
          user_id: string
          vehicle_id: string
          work_completed_at: string | null
          work_started_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          preferred_pickup_time?: string | null
          scheduled_pickup_time?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
          user_id: string
          vehicle_id: string
          work_completed_at?: string | null
          work_started_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          preferred_pickup_time?: string | null
          scheduled_pickup_time?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string
          work_completed_at?: string | null
          work_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_ownership_history: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          owner_id: string
          started_at: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          started_at?: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          started_at?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_ownership_history_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_ownership_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_photos: {
        Row: {
          created_at: string
          id: string
          photo_type: string
          storage_path: string
          uploaded_at: string
          uploaded_by: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_type: string
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_type?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          drive_train: string | null
          engine_size: string | null
          expected_return_date: string | null
          id: string
          is_active: boolean | null
          license_no: string | null
          location_status: string | null
          make: string
          mileage: number | null
          model: string
          reg_no: string | null
          trim_code: string | null
          updated_at: string
          user_id: string
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          drive_train?: string | null
          engine_size?: string | null
          expected_return_date?: string | null
          id?: string
          is_active?: boolean | null
          license_no?: string | null
          location_status?: string | null
          make: string
          mileage?: number | null
          model: string
          reg_no?: string | null
          trim_code?: string | null
          updated_at?: string
          user_id: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          drive_train?: string | null
          engine_size?: string | null
          expected_return_date?: string | null
          id?: string
          is_active?: boolean | null
          license_no?: string | null
          location_status?: string | null
          make?: string
          mileage?: number | null
          model?: string
          reg_no?: string | null
          trim_code?: string | null
          updated_at?: string
          user_id?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          created_at: string
          employee_id: string
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_assign_employee: {
        Args: { ticket_id_param: string }
        Returns: string
      }
      create_audit_log: {
        Args: {
          action_type: string
          actor_id: string
          log_details?: string
          new_data?: Json
          old_data?: Json
          record_id: string
          table_name: string
        }
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "half_day"
      notification_type:
        | "ticket_created"
        | "ticket_approved"
        | "ticket_declined"
        | "ticket_assigned"
        | "work_started"
        | "work_completed"
        | "invoice_created"
        | "customer_deleted"
      ticket_status:
        | "pending"
        | "approved"
        | "declined"
        | "assigned"
        | "in_progress"
        | "ready_for_pickup"
        | "completed"
      user_role: "user" | "employee" | "admin"
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
      attendance_status: ["present", "absent", "late", "half_day"],
      notification_type: [
        "ticket_created",
        "ticket_approved",
        "ticket_declined",
        "ticket_assigned",
        "work_started",
        "work_completed",
        "invoice_created",
        "customer_deleted",
      ],
      ticket_status: [
        "pending",
        "approved",
        "declined",
        "assigned",
        "in_progress",
        "ready_for_pickup",
        "completed",
      ],
      user_role: ["user", "employee", "admin"],
    },
  },
} as const
