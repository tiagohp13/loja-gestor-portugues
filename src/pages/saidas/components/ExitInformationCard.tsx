
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';

type ExitInformationCardProps = {
  stockExit: any;
  totalValue: number;
  cleanNotes: (notes: string | undefined) => string;
  onViewOrder: () => void;
};

const ExitInformationCard: React.FC<ExitInformationCardProps> = ({
  stockExit,
  totalValue,
  cleanNotes,
  onViewOrder
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Venda</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Referência</p>
          <p>{stockExit.number}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Data</p>
          <p>{formatDateString(stockExit.date)}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Total</p>
          <p className="font-semibold">{formatCurrency(totalValue)}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Estado</p>
          <StatusBadge status={stockExit.status} />
        </div>
        
        {/* Apenas mostrar a seção de Notas se houver notas ou se for uma encomenda convertida */}
        {(stockExit.notes || (stockExit.fromOrderId && stockExit.fromOrderNumber)) && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm font-medium mb-1">Notas</p>
            
            {/* Mostrar as notas normais, se existirem */}
            {stockExit.notes && (
              <p className="whitespace-pre-wrap">
                {cleanNotes(stockExit.notes)}
              </p>
            )}
            
            {/* Mostrar informação da encomenda apenas se for uma conversão */}
            {stockExit.fromOrderId && stockExit.fromOrderNumber && (
              <p>
                Convertida da encomenda{' '}
                <a 
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={onViewOrder}
                >
                  {stockExit.fromOrderNumber}
                </a>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExitInformationCard;
