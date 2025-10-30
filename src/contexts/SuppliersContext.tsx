import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/errorUtils";
import { Supplier } from "../types";
import { mapDbSupplierToSupplier } from "../utils/mappers";

interface SuppliersContextType {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => Promise<Supplier>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplier: (id: string) => Supplier | undefined;
  isLoading: boolean;
  refreshSuppliers: () => Promise<void>;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export const useSuppliers = () => {
  const context = useContext(SuppliersContext);
  if (!context) {
    throw new Error("useSuppliers must be used within a SuppliersProvider");
  }
  return context;
};

export const SuppliersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;

      if (data) {
        const formattedSuppliers = data.map(mapDbSupplierToSupplier);
        setSuppliers(formattedSuppliers);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();

    // Realtime subscription
    const channel = supabase
      .channel("public:suppliers")
      .on("postgres_changes", { event: "*", schema: "public", table: "suppliers" }, () => {
        fetchSuppliers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSupplier = (id: string): Supplier | undefined => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  const addSupplier = async (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSupplier = mapDbSupplierToSupplier(data);
        setSuppliers([...suppliers, newSupplier]);
        toast.success("Fornecedor criado com sucesso");
        return newSupplier;
      }

      throw new Error("Failed to add supplier");
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar o fornecedor"));
      throw error;
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from("suppliers")
        .update({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          tax_id: supplier.taxId,
          payment_terms: supplier.paymentTerms,
          notes: supplier.notes,
          status: supplier.status,
        })
        .eq("id", id);

      if (error) throw error;

      setSuppliers(suppliers.map((s) => (s.id === id ? { ...s, ...supplier } : s)));
      toast.success("Fornecedor atualizado com sucesso");
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar o fornecedor"));
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "suppliers",
        record_id: id,
      });

      if (error) throw error;

      setSuppliers(suppliers.filter((s) => s.id !== id));
      toast.success("Fornecedor eliminado com sucesso");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar o fornecedor"));
      throw error;
    }
  };

  const refreshSuppliers = async () => {
    await fetchSuppliers();
  };

  return (
    <SuppliersContext.Provider
      value={{
        suppliers,
        setSuppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplier,
        isLoading,
        refreshSuppliers,
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
};
