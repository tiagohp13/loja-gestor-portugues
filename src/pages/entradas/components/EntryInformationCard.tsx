
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import StatusBadge from '@/components/common/StatusBadge';

interface EntryInformationCardProps {
  entryNumber: string;
  entryDate: string;
  totalValue: number;
  status?: string;
  notes?: string;
}

const EntryInformationCard: React.FC<EntryInformationCardProps> = ({
  entryNumber,
  entryDate,
  totalValue,
  status,
  notes
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Compra</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Referência</p>
          <p>{entryNumber}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Data</p>
          <p>{formatDateString(entryDate)}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Total</p>
          <p className="font-semibold">{formatCurrency(totalValue)}</p>
        </div>
        {status && (
          <div>
            <p className="text-sm font-medium mb-1">Estado</p>
            <StatusBadge status={status} />
          </div>
        )}
        {notes && (
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm font-medium mb-1">Notas</p>
            <p className="whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntryInformationCard;
