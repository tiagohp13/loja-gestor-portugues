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
      categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          product_count: number | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          product_count?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          product_count?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          last_purchase_date: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          last_purchase_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          last_purchase_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      counters: {
        Row: {
          current_count: number
          id: string
          year: number
        }
        Insert: {
          current_count?: number
          id: string
          year: number
        }
        Update: {
          current_count?: number
          id?: string
          year?: number
        }
        Relationships: []
      }
      expense_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          expense_id: string | null
          id: string
          product_name: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          expense_id?: string | null
          id?: string
          product_name: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          expense_id?: string | null
          id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_items_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          created_at: string
          date: string
          deleted_at: string | null
          discount: number | null
          id: string
          notes: string | null
          number: string
          status: string | null
          supplier_id: string | null
          supplier_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          number: string
          status?: string | null
          supplier_id?: string | null
          supplier_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          number?: string
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_targets: {
        Row: {
          created_at: string | null
          id: string
          kpi_name: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kpi_name: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kpi_name?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          sale_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string | null
          client_name: string | null
          converted_to_stock_exit_id: string | null
          converted_to_stock_exit_number: string | null
          created_at: string
          date: string
          deleted_at: string | null
          discount: number | null
          id: string
          migrated_at: string | null
          notes: string | null
          number: string
          reference_old: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          converted_to_stock_exit_id?: string | null
          converted_to_stock_exit_number?: string | null
          created_at?: string
          date?: string
          deleted_at?: string | null
          discount?: number | null
          id?: string
          migrated_at?: string | null
          notes?: string | null
          number: string
          reference_old?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          converted_to_stock_exit_id?: string | null
          converted_to_stock_exit_number?: string | null
          created_at?: string
          date?: string
          deleted_at?: string | null
          discount?: number | null
          id?: string
          migrated_at?: string | null
          notes?: string | null
          number?: string
          reference_old?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_history: {
        Row: {
          change_date: string
          change_reason: string | null
          created_at: string
          id: string
          new_purchase_price: number | null
          new_sale_price: number | null
          old_purchase_price: number | null
          old_sale_price: number | null
          product_id: string
          user_id: string
        }
        Insert: {
          change_date?: string
          change_reason?: string | null
          created_at?: string
          id?: string
          new_purchase_price?: number | null
          new_sale_price?: number | null
          old_purchase_price?: number | null
          old_sale_price?: number | null
          product_id: string
          user_id?: string
        }
        Update: {
          change_date?: string
          change_reason?: string | null
          created_at?: string
          id?: string
          new_purchase_price?: number | null
          new_sale_price?: number | null
          old_purchase_price?: number | null
          old_sale_price?: number | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_price_history_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          code: string
          created_at: string
          current_stock: number
          deleted_at: string | null
          description: string | null
          id: string
          image: string | null
          min_stock: number
          name: string
          purchase_price: number
          sale_price: number
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          min_stock?: number
          name: string
          purchase_price?: number
          sale_price?: number
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          min_stock?: number
          name?: string
          purchase_price?: number
          sale_price?: number
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stock_entries: {
        Row: {
          created_at: string
          date: string
          deleted_at: string | null
          id: string
          invoice_number: string | null
          migrated_at: string | null
          notes: string | null
          number: string
          reference_old: string | null
          status: string | null
          supplier_id: string | null
          supplier_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          id?: string
          invoice_number?: string | null
          migrated_at?: string | null
          notes?: string | null
          number: string
          reference_old?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          deleted_at?: string | null
          id?: string
          invoice_number?: string | null
          migrated_at?: string | null
          notes?: string | null
          number?: string
          reference_old?: string | null
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_entries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_entry_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          entry_id: string | null
          id: string
          product_id: string | null
          product_name: string
          purchase_price: number
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          entry_id?: string | null
          id?: string
          product_id?: string | null
          product_name: string
          purchase_price?: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          entry_id?: string | null
          id?: string
          product_id?: string | null
          product_name?: string
          purchase_price?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_entry_items_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "stock_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_entry_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_exit_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          exit_id: string | null
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sale_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          exit_id?: string | null
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          exit_id?: string | null
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_exit_items_exit_id_fkey"
            columns: ["exit_id"]
            isOneToOne: false
            referencedRelation: "stock_exits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_exit_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_exits: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          date: string
          deleted_at: string | null
          discount: number | null
          from_order_id: string | null
          from_order_number: string | null
          id: string
          invoice_number: string | null
          migrated_at: string | null
          notes: string | null
          number: string
          reference_old: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          discount?: number | null
          from_order_id?: string | null
          from_order_number?: string | null
          id?: string
          invoice_number?: string | null
          migrated_at?: string | null
          notes?: string | null
          number: string
          reference_old?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          discount?: number | null
          from_order_id?: string | null
          from_order_number?: string | null
          id?: string
          invoice_number?: string | null
          migrated_at?: string | null
          notes?: string | null
          number?: string
          reference_old?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_exits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_exits_from_order_id_fkey"
            columns: ["from_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          type: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          access_level: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          language: string | null
          name: string | null
          phone: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          name?: string | null
          phone?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          name?: string | null
          phone?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_delete_data: {
        Args: { user_id?: string }
        Returns: boolean
      }
      can_write_data: {
        Args: { user_id?: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          max_attempts?: number
          operation_type: string
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_deleted_records: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      duplicate_order: {
        Args: { order_id_to_duplicate: string }
        Returns: string
      }
      generate_padded_sequence: {
        Args: { items: Json; prefix: string } | { items: Json; prefix?: string }
        Returns: {
          id: string
          new_number: string
        }[]
      }
      get_deleted_records: {
        Args: Record<PropertyKey, never>
        Returns: {
          additional_info: Json
          deleted_at: string
          id: string
          name: string
          table_type: string
        }[]
      }
      get_next_counter: {
        Args: { counter_id: string }
        Returns: string
      }
      get_next_counter_by_year: {
        Args: { counter_id: string; target_year: number }
        Returns: string
      }
      get_order_items: {
        Args: { p_order_id: string }
        Returns: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          sale_price: number
        }[]
      }
      get_orders: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
          client_name: string
          converted_to_exit_id: string
          created_at: string
          date: string
          discount: number
          id: string
          notes: string
          order_number: string
          status: string
          updated_at: string
        }[]
      }
      get_stock_entries: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          date: string
          discount: number
          entry_number: string
          id: string
          invoice_number: string
          notes: string
          status: string
          supplier_id: string
          supplier_name: string
          updated_at: string
        }[]
      }
      get_stock_entry_items: {
        Args: { p_entry_id: string }
        Returns: {
          entry_id: string
          id: string
          product_id: string
          product_name: string
          purchase_price: number
          quantity: number
        }[]
      }
      get_stock_exit: {
        Args: { p_exit_id: string }
        Returns: {
          client_id: string
          client_name: string
          created_at: string
          date: string
          discount: number
          exit_number: string
          from_order_id: string
          id: string
          invoice_number: string
          notes: string
          reason: string
          status: string
          updated_at: string
        }[]
      }
      get_stock_exit_items: {
        Args: { p_exit_id: number } | { p_exit_id: string }
        Returns: {
          exit_id: string
          id: string
          product_id: string
          product_name: string
          quantity: number
          sale_price: number
        }[]
      }
      get_stock_exits: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
          client_name: string
          created_at: string
          date: string
          discount: number
          exit_number: string
          from_order_id: string
          id: string
          invoice_number: string
          notes: string
          reason: string
          status: string
          updated_at: string
        }[]
      }
      get_user_access_level: {
        Args: { user_id?: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          affected_id?: string
          affected_table?: string
          event_description: string
          event_type: string
        }
        Returns: undefined
      }
      permanent_delete_record: {
        Args: { record_id: string; table_name: string }
        Returns: boolean
      }
      restore_record: {
        Args: { record_id: string; table_name: string }
        Returns: boolean
      }
      soft_delete_record: {
        Args: { record_id: string; table_name: string }
        Returns: boolean
      }
      table_exists: {
        Args:
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
