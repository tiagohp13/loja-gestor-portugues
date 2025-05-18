
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Product, StockEntry, StockExit } from '@/types';

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, getProductHistory, isLoading } = useData();
  const [product, setProduct] = useState<Product | null>(null);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [stockExits, setStockExits] = useState<StockExit[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = () => {
      const foundProduct = getProduct(id);
      if (!foundProduct) {
        return;
      }

      setProduct(foundProduct);
      const history = getProductHistory(id);
      setStockEntries(history.entries);
      setStockExits(history.exits);
    };

    fetchData();
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
  };
};

export default useProductDetail;
