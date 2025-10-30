import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/errorUtils";
import { Category } from "../types";
import { mapDbCategoryToCategory } from "../utils/mappers";

interface CategoriesContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string) => Category | undefined;
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;

      if (data) {
        const formattedCategories = data.map(mapDbCategoryToCategory);
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Realtime subscription
    const channel = supabase
      .channel("public:categories")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getCategory = (id: string): Category | undefined => {
    return categories.find((category) => category.id === id);
  };

  const addCategory = async (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount || 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCategory = mapDbCategoryToCategory(data);
        setCategories([...categories, newCategory]);
        toast.success("Categoria criada com sucesso");
        return newCategory;
      }

      throw new Error("Failed to add category");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar a categoria"));
      throw error;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: category.name,
          description: category.description,
          status: category.status,
          product_count: category.productCount,
        })
        .eq("id", id);

      if (error) throw error;

      setCategories(categories.map((c) => (c.id === id ? { ...c, ...category } : c)));
      toast.success("Categoria atualizada com sucesso");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar a categoria"));
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "categories",
        record_id: id,
      });

      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Categoria eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar a categoria"));
      throw error;
    }
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategory,
        isLoading,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};
