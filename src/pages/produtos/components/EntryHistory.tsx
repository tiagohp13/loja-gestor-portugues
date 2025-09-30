import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import { EntryItem } from '../types/productHistoryTypes';

interface EntryHistoryProps {
  entriesForProduct: EntryItem[];
  totalUnitsPurchased: number;
  totalAmountSpent: number;
}

const EntryHistory: React.FC<EntryHistoryProps> = ({
  entriesForProduct,
  totalUnitsPurchased,
  totalAmountSpent
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Histórico de Entradas</h3>
      {entriesForProduct.length === 0 ? (
        <p className="text-muted-foreground">Sem entradas registadas para este produto.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nº Entrada</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entriesForProduct.map((entry, index) => (
                <TableRow 
                  key={index}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => entry.id && navigate(`/entradas/${entry.id}`)}
                >
                  <TableCell>{formatDateString(entry.date)}</TableCell>
                  <TableCell className="text-primary hover:underline">{entry.number}</TableCell>
                  <TableCell>{entry.document}</TableCell>
                  <TableCell>{entry.supplierName}</TableCell>
                  <TableCell className="text-right">{entry.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell colSpan={4}>Total de Unidades Compradas:</TableCell>
                <TableCell className="text-right">{totalUnitsPurchased}</TableCell>
                <TableCell className="text-right">Total Gasto:</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAmountSpent)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EntryHistory;
