import { useState, useCallback, useMemo } from 'react';
import { Product } from '@/types';

interface ProductFormData {
  quantity: number;
  price: number;
  isManual: boolean;
}

interface UseStockBaixoFormProps {
  products: Product[];
}

const MAX_QUANTITY = 99999;
const MAX_PRICE = 999999.99;

/**
 * Custom hook to manage Stock Baixo form state
 * Centralizes all form logic for better maintainability
 */
export const useStockBaixoForm = ({ products }: UseStockBaixoFormProps) => {
  const [selectedProducts, setSelectedProducts] = useState<Map<string, ProductFormData>>(new Map());
  const [fornecedorId, setFornecedorId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate default quantity for a product (minStock - currentStock, minimum 1)
  const getDefaultQuantity = useCallback((product: Product): number => {
    return Math.max(1, product.minStock - product.currentStock);
  }, []);

  // Validate quantity value
  const validateQuantity = useCallback((value: number): number => {
    if (isNaN(value) || !isFinite(value)) return 1;
    return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(value)));
  }, []);

  // Validate price value
  const validatePrice = useCallback((value: number): number => {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.min(MAX_PRICE, Math.max(0, Number(value.toFixed(2))));
  }, []);

  // Toggle product selection
  const toggleProduct = useCallback((productId: string, isManual: boolean = false) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      
      if (newMap.has(productId)) {
        newMap.delete(productId);
      } else {
        const product = products.find(p => p.id === productId);
        if (!product) return prev;

        newMap.set(productId, {
          quantity: getDefaultQuantity(product),
          price: 0,
          isManual,
        });
      }
      
      return newMap;
    });
  }, [products, getDefaultQuantity]);

  // Update quantity for a product
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(productId);
      
      if (!existing) return prev;
      
      newMap.set(productId, {
        ...existing,
        quantity: validateQuantity(quantity),
      });
      
      return newMap;
    });
  }, [validateQuantity]);

  // Update price for a product
  const updatePrice = useCallback((productId: string, price: number) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(productId);
      
      if (!existing) return prev;
      
      newMap.set(productId, {
        ...existing,
        price: validatePrice(price),
      });
      
      return newMap;
    });
  }, [validatePrice]);

  // Add manual product
  const addManualProduct = useCallback((productId: string) => {
    toggleProduct(productId, true);
    setSearchTerm('');
  }, [toggleProduct]);

  // Available products for manual selection
  const availableProducts = useMemo(() => {
    if (!searchTerm) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return products
      .filter(p => 
        !selectedProducts.has(p.id) &&
        (p.name.toLowerCase().includes(searchLower) ||
         p.code.toLowerCase().includes(searchLower))
      )
      .slice(0, 5); // Limit to 5 results for performance
  }, [products, selectedProducts, searchTerm]);

  // Get selected products with their data
  const getSelectedProductsData = useCallback(() => {
    const items: Array<{
      produtoId: string;
      produtoNome: string;
      quantidade: number;
      preco: number;
      stockAtual: number;
      stockMinimo: number;
      origem: 'manual' | 'stock_baixo';
    }> = [];

    selectedProducts.forEach((formData, productId) => {
      const product = products.find(p => p.id === productId);
      if (!product) return; // Skip if product not found

      items.push({
        produtoId: product.id,
        produtoNome: product.name,
        quantidade: formData.quantity,
        preco: formData.price,
        stockAtual: product.currentStock,
        stockMinimo: product.minStock,
        origem: formData.isManual ? 'manual' : 'stock_baixo',
      });
    });

    return items;
  }, [selectedProducts, products]);

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedProducts(new Map());
    setFornecedorId('');
    setObservacoes('');
    setSearchTerm('');
  }, []);

  // Validate form before submission
  const validateForm = useCallback((): { isValid: boolean; error?: string } => {
    if (selectedProducts.size === 0) {
      return { isValid: false, error: 'Selecione pelo menos um produto' };
    }

    if (!fornecedorId) {
      return { isValid: false, error: 'Selecione um fornecedor' };
    }

    // Check if all selected products still exist
    const missingProducts: string[] = [];
    selectedProducts.forEach((_, productId) => {
      const product = products.find(p => p.id === productId);
      if (!product) {
        missingProducts.push(productId);
      }
    });

    if (missingProducts.length > 0) {
      return { 
        isValid: false, 
        error: `Alguns produtos selecionados não foram encontrados. Atualize a página.` 
      };
    }

    return { isValid: true };
  }, [selectedProducts, fornecedorId, products]);

  return {
    // State
    selectedProducts,
    fornecedorId,
    observacoes,
    searchTerm,
    availableProducts,

    // Setters
    setFornecedorId,
    setObservacoes,
    setSearchTerm,

    // Actions
    toggleProduct,
    updateQuantity,
    updatePrice,
    addManualProduct,
    resetForm,

    // Getters
    getSelectedProductsData,
    validateForm,

    // Computed values
    selectedCount: selectedProducts.size,
  };
};
