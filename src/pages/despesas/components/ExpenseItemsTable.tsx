
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { ExpenseItem } from '@/types';

interface ExpenseItemsTableProps {
  items: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>, value: string | number) => void;
}

const ExpenseItemsTable: React.FC<ExpenseItemsTableProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Itens da Despesa</CardTitle>
          <Button type="button" onClick={onAddItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gestorApp-gray">
            <p>Nenhum item adicionado ainda.</p>
            <Button type="button" onClick={onAddItem} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Item
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Desconto (%)</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice;
                const discountAmount = itemTotal * (item.discountPercent / 100);
                const subtotal = itemTotal - discountAmount;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.productName}
                        onChange={(e) => onUpdateItem(index, 'productName', e.target.value)}
                        placeholder="Nome do produto"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discountPercent}
                        onChange={(e) => onUpdateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(subtotal)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseItemsTable;
