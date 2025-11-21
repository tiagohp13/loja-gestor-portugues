import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExportDataType } from "@/types";
import { z } from "zod";

// Validation schemas
const productSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  purchasePrice: z.number().min(0),
  salePrice: z.number().min(0),
  currentStock: z.number().int().min(0),
  minStock: z.number().int().min(0),
});

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const clientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
  paymentTerms: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export const useDataImport = () => {
  const [isImporting, setIsImporting] = useState(false);

  const validateData = (type: ExportDataType, data: any[]): { valid: any[]; errors: string[] } => {
    const valid: any[] = [];
    const errors: string[] = [];

    const schemaMap: Record<string, z.ZodSchema> = {
      products: productSchema,
      categories: categorySchema,
      clients: clientSchema,
      suppliers: supplierSchema,
    };

    const schema = schemaMap[type];
    if (!schema) {
      return { valid: data, errors: [] }; // No validation for orders, stock entries, etc.
    }

    data.forEach((item, index) => {
      try {
        const validated = schema.parse(item);
        valid.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Linha ${index + 1}: ${error.errors.map(e => e.message).join(", ")}`);
        }
      }
    });

    return { valid, errors };
  };

  const importData = async (type: ExportDataType, jsonContent: string): Promise<ImportResult> => {
    setIsImporting(true);
    
    try {
      const parsed = JSON.parse(jsonContent);
      let dataArray: any[] = [];

      // Handle "all" type
      if (type === "all") {
        toast.error("Importação em lote não implementada. Importe cada tipo individualmente.");
        return { success: false, imported: 0, errors: ["Bulk import not supported"] };
      }

      // Ensure we have an array
      dataArray = Array.isArray(parsed) ? parsed : [parsed];

      if (dataArray.length === 0) {
        toast.error("Nenhum dado encontrado no ficheiro");
        return { success: false, imported: 0, errors: ["No data found"] };
      }

      // Validate data
      const { valid, errors: validationErrors } = validateData(type, dataArray);

      if (valid.length === 0) {
        toast.error("Nenhum registo válido encontrado");
        return { success: false, imported: 0, errors: validationErrors };
      }

      // Map type to table name
      const tableMap: Record<string, string> = {
        products: "products",
        categories: "categories",
        clients: "clients",
        suppliers: "suppliers",
        orders: "orders",
        stockEntries: "stock_entries",
        stockExits: "stock_exits",
        expenses: "expenses",
      };

      const tableName = tableMap[type as keyof typeof tableMap];
      if (!tableName) {
        throw new Error(`Unknown type: ${type}`);
      }

      // Import data in batches of 100
      const batchSize = 100;
      let imported = 0;
      const errors: string[] = [...validationErrors];

      for (let i = 0; i < valid.length; i += batchSize) {
        const batch = valid.slice(i, i + batchSize);
        
        // Remove id, createdAt, updatedAt to let DB generate them
        const cleanBatch = batch.map(({ id, createdAt, updatedAt, ...rest }) => rest);

        const { error } = await supabase
          .from(tableName as any)
          .insert(cleanBatch);

        if (error) {
          console.error(`Import error for batch ${i / batchSize + 1}:`, error);
          errors.push(`Erro no lote ${i / batchSize + 1}: ${error.message}`);
        } else {
          imported += batch.length;
        }
      }

      // Audit log
      console.log(`[AUDIT] User imported ${imported} ${type} records at ${new Date().toISOString()}`);

      if (imported > 0) {
        toast.success(`${imported} registos importados com sucesso!`);
        if (errors.length > 0) {
          toast.warning(`${errors.length} registos com erros foram ignorados`);
        }
        return { success: true, imported, errors };
      } else {
        toast.error("Falha ao importar dados");
        return { success: false, imported: 0, errors };
      }

    } catch (error) {
      console.error("Import error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao importar: ${errorMessage}`);
      return { success: false, imported: 0, errors: [errorMessage] };
    } finally {
      setIsImporting(false);
    }
  };

  return { importData, isImporting };
};
