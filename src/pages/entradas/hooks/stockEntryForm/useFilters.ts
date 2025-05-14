
import { useMemo } from 'react';

interface UseFiltersProps {
  searchTerm: string;
  supplierSearchTerm: string;
  products: Array<{
    id: string;
    name: string;
    code: string;
    currentStock: number;
  }>;
  suppliers: Array<{
    id: string;
    name: string;
  }>;
}

export const useFilters = ({
  searchTerm,
  supplierSearchTerm,
  products,
  suppliers
}: UseFiltersProps) => {
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearchTerm) return suppliers;
    
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
    );
  }, [supplierSearchTerm, suppliers]);

  return {
    filteredProducts,
    filteredSuppliers
  };
};
