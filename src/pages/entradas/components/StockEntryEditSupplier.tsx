
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
    <div className="space-y-2">
      <label htmlFor="supplierId" className="text-sm font-medium text-gestorApp-gray-dark">
        Fornecedor
      </label>
      <Select
        value={supplierId || undefined}
        onValueChange={onSupplierChange}
      >
        <SelectTrigger id="supplierId" className="w-full">
          <SelectValue placeholder="Selecione um fornecedor" />
        </SelectTrigger>
        <SelectContent>
          {/* Item placeholder com valor não vazio */}
          <SelectItem value="placeholder">Selecione um fornecedor</SelectItem>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StockEntryEditSupplier;
