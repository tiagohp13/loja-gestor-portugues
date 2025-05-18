
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Supplier } from '@/types';

interface StockEntryEditSupplierProps {
  supplierId: string;
  suppliers: Supplier[];
  onSupplierChange: (value: string) => void;
}

const StockEntryEditSupplier: React.FC<StockEntryEditSupplierProps> = ({
  supplierId,
  suppliers,
  onSupplierChange
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Fornecedor</h2>
      
      <div className="space-y-2">
        <label htmlFor="supplier" className="text-sm font-medium">
          Fornecedor
        </label>
        <Select value={supplierId} onValueChange={onSupplierChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar fornecedor" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StockEntryEditSupplier;
