
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Supplier } from '@/types';

interface ExpenseBasicInfoProps {
  suppliers: Supplier[];
  supplierId: string;
  date: string;
  notes: string;
  onSupplierChange: (supplierId: string) => void;
  onDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
}

const ExpenseBasicInfo: React.FC<ExpenseBasicInfoProps> = ({
  suppliers,
  supplierId,
  date,
  notes,
  onSupplierChange,
  onDateChange,
  onNotesChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Despesa</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="supplier">Fornecedor *</Label>
          <Select value={supplierId} onValueChange={onSupplierChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fornecedor" />
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

        <div>
          <Label htmlFor="date">Data da Despesa *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas adicionais sobre a despesa..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBasicInfo;
