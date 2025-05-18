
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Supplier, StockEntry } from '@/types';

export const useSupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, getSupplierHistory } = useData();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierEntries, setSupplierEntries] = useState<StockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    const fetchData = () => {
      const foundSupplier = getSupplier(id);
      if (!foundSupplier) {
        setIsLoading(false);
        return;
      }

      setSupplier(foundSupplier);
      
      const history = getSupplierHistory(id);
      setSupplierEntries(history.entries);
      
      setIsLoading(false);
    };

    fetchData();
  }, [id, getSupplier, getSupplierHistory]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return {
    supplier,
    supplierEntries,
    isLoading,
    handleNavigate,
  };
};

export default useSupplierDetail;
