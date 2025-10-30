import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Realtime subscription
    const channel = supabase
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getProduct = (id: string): Product | undefined => {
    return products.find((product) => product.id === id);
  };

  const findProduct = (id: string): Product | undefined => {
    return products.find((product) => product.id === id);
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
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

      if (data) {
        const newProduct = mapDbProductToProduct(data);
        setProducts([...products, newProduct]);
        toast.success("Produto criado com sucesso");
        return newProduct;
      }

      throw new Error("Failed to add product");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível criar o produto"));
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
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

      setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)));
      toast.success("Produto atualizado com sucesso");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível atualizar o produto"));
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.rpc("soft_delete_record", {
        table_name: "products",
        record_id: id,
      });

      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produto eliminado com sucesso");
    } catch (error) {
      console.error("Error soft deleting product:", error);
      toast.error(getUserFriendlyError(error, "Não foi possível eliminar o produto"));
      throw error;
    }
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        findProduct,
        isLoading,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
