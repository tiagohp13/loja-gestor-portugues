import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import { ExitItem } from '../types/productHistoryTypes';

interface ExitHistoryProps {
  exitsForProduct: ExitItem[];
  totalUnitsSold: number;
  totalAmountSold: number;
}

const ExitHistory: React.FC<ExitHistoryProps> = ({
  exitsForProduct,
  totalUnitsSold,
  totalAmountSold
}) => {
  const navigate = useNavigate();

  const handleNavigateToClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clientes/${clientId}`);
  };

  const handleNavigateToExit = (exitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/saidas/${exitId}`);
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Histórico de Saídas</h3>
      {exitsForProduct.length === 0 ? (
        <p className="text-muted-foreground">Sem saídas registadas para este produto.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nº Saída</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exitsForProduct.map((exit, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDateString(exit.date)}</TableCell>
                  <TableCell 
                    className="text-primary hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/saidas/${exit.exitId}`);
                    }}
                  >
                    {exit.number}
                  </TableCell>
                  <TableCell>{exit.document}</TableCell>
                  <TableCell>
                    {exit.clientId ? (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clientes/${exit.clientId}`);
                        }}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {exit.clientName}
                      </span>
                    ) : (
                      <span>{exit.clientName}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{exit.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(exit.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(exit.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell colSpan={4}>Total de Unidades Vendidas:</TableCell>
                <TableCell className="text-right">{totalUnitsSold}</TableCell>
                <TableCell className="text-right">Total Vendido:</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAmountSold)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ExitHistory;
