import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/errorUtils";
import { Product } from "../types";
import { mapDbProductToProduct } from "../utils/mappers";

interface ProductsContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  findProduct: (id: string) => Product | undefined;
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("deleted_at", null)
        .order("name");

      if (error) throw error;

      if (data) {
        const formattedProducts = data.map(mapDbProductToProduct);
        setProducts(formattedProducts);
      }
    } catch (error) {
      // Error handled by toast
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Realtime SUB only for update/delete
    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, fetchProducts)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "products" }, fetchProducts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getProduct = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  const findProduct = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  // ---------------------
  // CREATE PRODUCT
  // ---------------------
  const addProduct = useCallback(async (product) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          code: product.code,
          name: product.name,
          description: product.description,
          category: product.category,
          purchase_price: product.purchasePrice,
          sale_price: product.salePrice,
          current_stock: product.currentStock,
          min_stock: product.minStock,
          image: product.image,
          status: product.status,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct = mapDbProductToProduct(data);
      setProducts(prev => [...prev, newProduct]);

      // 🔥 Atualizar lista para garantir consistência com paginação
      await fetchProducts();

      toast.success("Produto criado com sucesso");
      return newProduct;

    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar o produto"));
      throw error;
    }
  }, []);

  // ---------------------
  // UPDATE PRODUCT
  // ---------------------
  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    try {
      const updateData: any = {};

      if (product.code !== undefined) updateData.code = product.code;
      if (product.name !== undefined) updateData.name = product.name;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.category !== undefined) updateData.category = product.category;
      if (product.purchasePrice !== undefined) updateData.purchase_price = Number(product.purchasePrice);
      if (product.salePrice !== undefined) updateData.sale_price = Number(product.salePrice);
      if (product.currentStock !== undefined) updateData.current_stock = Number(product.currentStock);
      if (product.minStock !== undefined) updateData.min_stock = Number(product.minStock);
      if (product.image !== undefined) updateData.image = product.image;
      if (product.status !== undefined) updateData.status = product.status;

      const { error } = await supabase.from("products").update(updateData).eq("id", id);

      if (error) throw error;

      // Atualiza local
      setProducts(prev => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
      toast.success("Produto atualizado com sucesso");

      // 🔥 Linha essencial:
      await fetchProducts();

    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar o produto"));
      throw error;
    }
  }, []);

  // ---------------------
  // DELETE PRODUCT
  // ---------------------
  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "products",
        record_id: id,
      });

      if (error) throw error;

      setProducts(prev => prev.filter((p) => p.id !== id));
      toast.success("Produto eliminado com sucesso");

      // 🔥 Garantir atualização em listas paginadas
      await fetchProducts();

    } catch (error) {
      console.error("Error soft deleting product:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar o produto"));
      throw error;
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, []);

  const contextValue = useMemo(() => ({
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    findProduct,
    isLoading,
    refreshProducts,
  }), [products, addProduct, updateProduct, deleteProduct, getProduct, findProduct, isLoading, refreshProducts]);

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
};
