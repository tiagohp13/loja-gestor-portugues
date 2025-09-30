
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Product, StockEntry, StockExit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbProductToProduct } from '@/utils/mappers';

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, getProductHistory, isLoading } = useData();
  const [product, setProduct] = useState<Product | null>(null);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      let foundProduct = getProduct(id);
      
      // If not found in context, try to fetch from database (including deleted)
      if (!foundProduct) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
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
      const history = getProductHistory(id);
      setStockEntries(history.entries);
      setStockExits(history.exits);
    };

    fetchProduct();
  }, [id, getProduct, getProductHistory]);

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
