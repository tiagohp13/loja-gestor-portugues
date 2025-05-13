
import React from 'react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface StockEntryEditDetailsProps {
  date: string;
  invoiceNumber: string;
  notes: string;
  onDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const StockEntryEditDetails: React.FC<StockEntryEditDetailsProps> = ({
  date,
  invoiceNumber,
  notes,
  onDetailsChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium text-gestorApp-gray-dark">
          Data
        </label>
        <Input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={onDetailsChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="invoiceNumber" className="text-sm font-medium text-gestorApp-gray-dark">
          Número da Fatura
        </label>
        <Input
          id="invoiceNumber"
          name="invoiceNumber"
          value={invoiceNumber}
          onChange={onDetailsChange}
          placeholder="FAT2023XXXX"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={onDetailsChange}
          placeholder="Observações adicionais sobre a entrada..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
          rows={3}
        />
      </div>
    </>
  );
};

export default StockEntryEditDetails;
