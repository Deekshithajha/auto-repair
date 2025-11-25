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
          status: string
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
          status?: string
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
          status?: string
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
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json | null
          preferred_contact: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          preferred_contact?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          preferred_contact?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      damage_log: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          id: string
          is_completed: boolean | null
          logged_at: string
          logged_by: string | null
          photo_ids: string[] | null
          ticket_id: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          is_completed?: boolean | null
          logged_at?: string
          logged_by?: string | null
          photo_ids?: string[] | null
          ticket_id?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          is_completed?: boolean | null
          logged_at?: string
          logged_by?: string | null
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
      employee_details: {
        Row: {
          created_at: string
          employee_id: string
          employment_type: string
          hourly_rate: number | null
          id: string
          overtime_rate: number | null
          position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          employment_type?: string
          hourly_rate?: number | null
          id?: string
          overtime_rate?: number | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          employment_type?: string
          hourly_rate?: number | null
          id?: string
          overtime_rate?: number | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          employee_id: string
          employment_status: string
          hire_date: string
          id: string
          is_active: boolean | null
          termination_date: string | null
          termination_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          employment_status?: string
          hire_date: string
          id?: string
          is_active?: boolean | null
          termination_date?: string | null
          termination_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          employment_status?: string
          hire_date?: string
          id?: string
          is_active?: boolean | null
          termination_date?: string | null
          termination_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string | null
          subtotal: number
          tax_amount: number
          ticket_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number
          ticket_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
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
          message: string
          read: boolean | null
          sent_at: string | null
          ticket_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          sent_at?: string | null
          ticket_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          sent_at?: string | null
          ticket_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          part_name: string
          part_number: string | null
          quantity: number
          supplier: string | null
          ticket_id: string
          total_price: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          part_name: string
          part_number?: string | null
          quantity?: number
          supplier?: string | null
          ticket_id: string
          total_price?: number | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          part_name?: string
          part_number?: string | null
          quantity?: number
          supplier?: string | null
          ticket_id?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string
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
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          name: string | null
          phone: string | null
          system_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          name?: string | null
          phone?: string | null
          system_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          system_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          base_price: number
          category: string | null
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          mechanic_id: string
          notes: string | null
          ticket_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          mechanic_id: string
          notes?: string | null
          ticket_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          mechanic_id?: string
          notes?: string | null
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
          actual_cost: number | null
          completed_date: string | null
          created_at: string
          customer_id: string
          description: string | null
          estimated_cost: number | null
          id: string
          labor_cost: number | null
          notes: string | null
          notification_preferences: Json | null
          parts_cost: number | null
          photos: Json | null
          preferred_pickup_time: string | null
          primary_mechanic_id: string | null
          priority: string | null
          reschedule_date: string | null
          reschedule_reason: string | null
          scheduled_date: string | null
          secondary_mechanic_id: string | null
          service_ids: string[] | null
          status: Database["public"]["Enums"]["ticket_status"]
          tax_amount: number | null
          ticket_number: string | null
          title: string
          total_cost: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          actual_cost?: number | null
          completed_date?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          labor_cost?: number | null
          notes?: string | null
          notification_preferences?: Json | null
          parts_cost?: number | null
          photos?: Json | null
          preferred_pickup_time?: string | null
          primary_mechanic_id?: string | null
          priority?: string | null
          reschedule_date?: string | null
          reschedule_reason?: string | null
          scheduled_date?: string | null
          secondary_mechanic_id?: string | null
          service_ids?: string[] | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tax_amount?: number | null
          ticket_number?: string | null
          title: string
          total_cost?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          actual_cost?: number | null
          completed_date?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          labor_cost?: number | null
          notes?: string | null
          notification_preferences?: Json | null
          parts_cost?: number | null
          photos?: Json | null
          preferred_pickup_time?: string | null
          primary_mechanic_id?: string | null
          priority?: string | null
          reschedule_date?: string | null
          reschedule_reason?: string | null
          scheduled_date?: string | null
          secondary_mechanic_id?: string | null
          service_ids?: string[] | null
          status?: Database["public"]["Enums"]["ticket_status"]
          tax_amount?: number | null
          ticket_number?: string | null
          title?: string
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_primary_mechanic_id_fkey"
            columns: ["primary_mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_secondary_mechanic_id_fkey"
            columns: ["secondary_mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
      vehicle_photos: {
        Row: {
          created_at: string
          id: string
          photo_data: string
          photo_type: string
          updated_at: string
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_data: string
          photo_type?: string
          updated_at?: string
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_data?: string
          photo_type?: string
          updated_at?: string
          uploaded_by?: string | null
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
          color: string | null
          created_at: string
          id: string
          license_plate: string
          location_status: string | null
          make: string
          mileage: number | null
          model: string
          notes: string | null
          owner_id: string
          photos: Json | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          license_plate: string
          location_status?: string | null
          make: string
          mileage?: number | null
          model: string
          notes?: string | null
          owner_id: string
          photos?: Json | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          license_plate?: string
          location_status?: string | null
          make?: string
          mileage?: number | null
          model?: string
          notes?: string | null
          owner_id?: string
          photos?: Json | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          created_at: string
          employee_id: string
          ended_at: string | null
          hours_worked: number | null
          id: string
          notes: string | null
          started_at: string
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          ended_at?: string | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          started_at?: string
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          ended_at?: string | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          started_at?: string
          status?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      generate_ticket_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "customer"
      notification_type:
        | "repair_completed"
        | "service_reminder"
        | "payment_due"
        | "vehicle_ready"
      ticket_status:
        | "pending"
        | "in_progress"
        | "awaiting_parts"
        | "completed"
        | "cancelled"
      vehicle_status: "active" | "in_service" | "archived"
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
      app_role: ["admin", "employee", "customer"],
      notification_type: [
        "repair_completed",
        "service_reminder",
        "payment_due",
        "vehicle_ready",
      ],
      ticket_status: [
        "pending",
        "in_progress",
        "awaiting_parts",
        "completed",
        "cancelled",
      ],
      vehicle_status: ["active", "in_service", "archived"],
    },
  },
} as const
