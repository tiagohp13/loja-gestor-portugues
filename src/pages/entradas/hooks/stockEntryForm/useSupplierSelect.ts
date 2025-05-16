
export const useSupplierSelect = (
  setEntryDetails: React.Dispatch<React.SetStateAction<{
    supplierId: string;
    supplierName: string;
    date: string;
    invoiceNumber: string;
    notes: string;
  }>>,
  setIsSupplierSearchOpen: React.Dispatch<React.SetStateAction<boolean>>,
  suppliers: Array<{
    id: string;
    name: string;
  }>
) => {
  const handleSupplierSearch = (value: string) => {
    return value;
  };

  const handleSupplierSelect = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    setEntryDetails(prev => ({
      ...prev,
      supplierId,
      supplierName: selectedSupplier?.name || ''
    }));
    setIsSupplierSearchOpen(false);
  };

  return {
    handleSupplierSearch,
    handleSupplierSelect
  };
};
