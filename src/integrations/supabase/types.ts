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
      Clientes: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          morada: string | null
          nif: string | null
          nome: string
          notas: string | null
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          morada?: string | null
          nif?: string | null
          nome: string
          notas?: string | null
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          morada?: string | null
          nif?: string | null
          nome?: string
          notas?: string | null
          telefone?: string | null
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
          encomendaid: string | null
          id: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Insert: {
          encomendaid?: string | null
          id?: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Update: {
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
          entryid: string | null
          id: string
          productid: string
          productname: string
          purchaseprice: number
          quantity: number
        }
        Insert: {
          entryid?: string | null
          id?: string
          productid: string
          productname: string
          purchaseprice: number
          quantity: number
        }
        Update: {
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
          exitid: string | null
          id: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Insert: {
          exitid?: string | null
          id?: string
          productid: string
          productname: string
          quantity: number
          saleprice: number
        }
        Update: {
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
