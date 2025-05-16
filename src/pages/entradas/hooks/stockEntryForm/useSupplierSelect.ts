
import { useState } from 'react';
import { EntryDetails } from './types';

interface SupplierSelectProps {
  suppliers: Array<{
    id: string;
    name: string;
  }>;
  setEntryDetails: React.Dispatch<React.SetStateAction<EntryDetails>>;
  setSupplierSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setIsSupplierSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useSupplierSelect = ({
  suppliers,
  setEntryDetails,
  setSupplierSearchTerm,
  setIsSupplierSearchOpen
}: SupplierSelectProps) => {
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const handleSupplierSearch = (value: string) => {
    return value;
  };

  const handleSupplierSelect = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setSelectedSupplier(supplier);
    setEntryDetails(prev => ({
      ...prev,
      supplierId,
      supplierName: supplier?.name || ''
    }));
    setSupplierSearchTerm('');
    setIsSupplierSearchOpen(false);
  };

  return {
    handleSupplierSearch,
    handleSupplierSelect,
    selectedSupplier
  };
};
