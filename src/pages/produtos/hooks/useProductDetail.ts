
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductsQuery } from '@/hooks/queries/useProducts';
import { useStockEntriesQuery } from '@/hooks/queries/useStockEntries';
import { useStockExitsQuery } from '@/hooks/queries/useStockExits';
import { Product, StockEntry, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbProductToProduct } from '@/utils/mappers';

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, isLoading } = useProductsQuery();
  const { stockEntries: allStockEntries } = useStockEntriesQuery();
  const { stockExits: allStockExits } = useStockExitsQuery();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  // Get product history
  const stockEntries = useMemo(() => {
    if (!id) return [];
    return allStockEntries.filter((entry) => 
      entry.items.some((item) => item.productId === id)
    );
  }, [id, allStockEntries]);

  const stockExits = useMemo(() => {
    if (!id) return [];
    return allStockExits.filter((exit) => 
      exit.items.some((item) => item.productId === id)
    );
  }, [id, allStockExits]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      let foundProduct = products.find(p => p.id === id);
      
      // If not found in context, try to fetch from database (including deleted)
      if (!foundProduct) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, code, name, description, category, purchase_price, sale_price, current_stock, min_stock, image, status, user_id, created_at, updated_at, deleted_at')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            foundProduct = mapDbProductToProduct(data);
            setIsDeleted(data.status === 'deleted');
          }
        } catch (error) {
          console.error('Error fetching deleted product:', error);
          return;
        }
      }

      if (!foundProduct) {
        return;
      }

      setProduct(foundProduct);
    };

    fetchProduct();
  }, [id, products]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    product,
    isLoading,
    stockEntries,
    stockExits,
    handleNavigate,
    isDeleted,
  };
};

export default useProductDetail;
