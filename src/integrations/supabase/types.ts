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
      categories: {
        Row: {
          created_at: string
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
      Clientes: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          taxId: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          taxId?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          taxId?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
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
      Encomendas: {
        Row: {
          clientid: string
          clientname: string
          convertedtostockexitid: string | null
          createdat: string | null
          date: string
          discount: number | null
          id: string
          notes: string | null
          ordernumber: string
          status: string
          updatedat: string | null
        }
        Insert: {
          clientid: string
          clientname: string
          convertedtostockexitid?: string | null
          createdat?: string | null
          date: string
          discount?: number | null
          id?: string
          notes?: string | null
          ordernumber: string
          status: string
          updatedat?: string | null
        }
        Update: {
          clientid?: string
          clientname?: string
          convertedtostockexitid?: string | null
          createdat?: string | null
          date?: string
          discount?: number | null
          id?: string
          notes?: string | null
          ordernumber?: string
          status?: string
          updatedat?: string | null
        }
        Relationships: []
      }
      EncomendasItems: {
        Row: {
          discount: number | null
          encomendaid: string | null
          id: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Insert: {
          discount?: number | null
          encomendaid?: string | null
          id?: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Update: {
          discount?: number | null
          encomendaid?: string | null
          id?: string
          productid?: string
          productname?: string
          quantity?: number
          saleprice?: number
        }
        Relationships: [
          {
            foreignKeyName: "EncomendasItems_encomendaid_fkey"
            columns: ["encomendaid"]
            isOneToOne: false
            referencedRelation: "Encomendas"
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
          discount: number | null
          id: string
          notes: string | null
          number: string
          reference_old: string | null
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
          discount?: number | null
          id?: string
          notes?: string | null
          number: string
          reference_old?: string | null
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
          discount?: number | null
          id?: string
          notes?: string | null
          number?: string
          reference_old?: string | null
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
      products: {
        Row: {
          category: string | null
          code: string
          created_at: string
          current_stock: number
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
      Produtos: {
        Row: {
          created_at: string
          id: string
          name: string | null
          price: number | null
          stock: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          price?: number | null
          stock?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          price?: number | null
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      stock_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          invoice_number: string | null
          notes: string | null
          number: string
          reference_old: string | null
          supplier_id: string | null
          supplier_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          number: string
          reference_old?: string | null
          supplier_id?: string | null
          supplier_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          number?: string
          reference_old?: string | null
          supplier_id?: string | null
          supplier_name?: string
          updated_at?: string
          user_id?: string | null
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
          discount: number | null
          from_order_id: string | null
          from_order_number: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          number: string
          reference_old: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string
          date?: string
          discount?: number | null
          from_order_id?: string | null
          from_order_number?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          number: string
          reference_old?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          date?: string
          discount?: number | null
          from_order_id?: string | null
          from_order_number?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          number?: string
          reference_old?: string | null
          updated_at?: string
          user_id?: string | null
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
      StockEntries: {
        Row: {
          createdat: string | null
          date: string
          discount: number | null
          entrynumber: string
          id: string
          invoicenumber: string | null
          notes: string | null
          status: string
          supplierid: string
          suppliername: string
          updatedat: string | null
        }
        Insert: {
          createdat?: string | null
          date: string
          discount?: number | null
          entrynumber: string
          id?: string
          invoicenumber?: string | null
          notes?: string | null
          status: string
          supplierid: string
          suppliername: string
          updatedat?: string | null
        }
        Update: {
          createdat?: string | null
          date?: string
          discount?: number | null
          entrynumber?: string
          id?: string
          invoicenumber?: string | null
          notes?: string | null
          status?: string
          supplierid?: string
          suppliername?: string
          updatedat?: string | null
        }
        Relationships: []
      }
      StockEntriesItems: {
        Row: {
          discount: number | null
          entryid: string | null
          id: string
          productid: string
          productname: string
          purchaseprice: number
          quantity: number
        }
        Insert: {
          discount?: number | null
          entryid?: string | null
          id?: string
          productid: string
          productname: string
          purchaseprice: number
          quantity: number
        }
        Update: {
          discount?: number | null
          entryid?: string | null
          id?: string
          productid?: string
          productname?: string
          purchaseprice?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "StockEntriesItems_entryid_fkey"
            columns: ["entryid"]
            isOneToOne: false
            referencedRelation: "StockEntries"
            referencedColumns: ["id"]
          },
        ]
      }
      StockExits: {
        Row: {
          clientid: string | null
          clientname: string | null
          createdat: string | null
          date: string
          discount: number | null
          exitnumber: string
          fromorderid: string | null
          id: string
          invoicenumber: string | null
          notes: string | null
          reason: string
          status: string
          updatedat: string | null
        }
        Insert: {
          clientid?: string | null
          clientname?: string | null
          createdat?: string | null
          date: string
          discount?: number | null
          exitnumber: string
          fromorderid?: string | null
          id?: string
          invoicenumber?: string | null
          notes?: string | null
          reason: string
          status: string
          updatedat?: string | null
        }
        Update: {
          clientid?: string | null
          clientname?: string | null
          createdat?: string | null
          date?: string
          discount?: number | null
          exitnumber?: string
          fromorderid?: string | null
          id?: string
          invoicenumber?: string | null
          notes?: string | null
          reason?: string
          status?: string
          updatedat?: string | null
        }
        Relationships: []
      }
      StockExitsItems: {
        Row: {
          discount: number | null
          exitid: string | null
          id: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Insert: {
          discount?: number | null
          exitid?: string | null
          id?: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Update: {
          discount?: number | null
          exitid?: string | null
          id?: string
          productid?: string
          productname?: string
          quantity?: number
          saleprice?: number
        }
        Relationships: [
          {
            foreignKeyName: "StockExitsItems_exitid_fkey"
            columns: ["exitid"]
            isOneToOne: false
            referencedRelation: "StockExits"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_counter: {
        Args: { counter_id: string }
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
          id: string
          client_id: string
          client_name: string
          order_number: string
          date: string
          notes: string
          status: string
          discount: number
          created_at: string
          updated_at: string
          converted_to_exit_id: string
        }[]
      }
      get_stock_entries: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          supplier_id: string
          supplier_name: string
          entry_number: string
          date: string
          invoice_number: string
          notes: string
          status: string
          discount: number
          created_at: string
          updated_at: string
        }[]
      }
      get_stock_entry_items: {
        Args: { p_entry_id: string }
        Returns: {
          id: string
          entry_id: string
          product_id: string
          product_name: string
          quantity: number
          purchase_price: number
        }[]
      }
      get_stock_exit: {
        Args: { p_exit_id: number } | { p_exit_id: string }
        Returns: {
          id: number
          clientid: number
          clientname: string
          reason: string
          exitnumber: string
          date: string
          invoicenumber: string
          notes: string
          status: string
          discount: number
          fromorderid: number
          createdat: string
          updatedat: string
        }[]
      }
      get_stock_exit_items: {
        Args: { p_exit_id: number } | { p_exit_id: string }
        Returns: {
          id: string
          exit_id: string
          product_id: string
          product_name: string
          quantity: number
          sale_price: number
        }[]
      }
      get_stock_exits: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          client_id: string
          client_name: string
          reason: string
          exit_number: string
          date: string
          invoice_number: string
          notes: string
          status: string
          discount: number
          from_order_id: string
          created_at: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
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
