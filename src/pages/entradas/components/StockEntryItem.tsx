
import React from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockEntry } from '@/types';
import { formatCurrency } from '@/utils/formatting';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

interface StockEntryItemProps {
  entry: StockEntry;
  onView: (id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  calculateEntryTotal: (entry: StockEntry) => number;
  canEdit?: boolean;
  canDelete?: boolean;
}

const StockEntryItem: React.FC<StockEntryItemProps> = ({ 
  entry, 
  onView, 
  onEdit, 
  onDelete,
  calculateEntryTotal,
  canEdit = true,
  canDelete = true
}) => {
  return (
    <tr 
      key={entry.id} 
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onView(entry.id)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gestorApp-blue">
        {entry.number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
        {format(new Date(entry.date), 'dd/MM/yyyy', { locale: pt })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
        {entry.supplierName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
        {entry.invoiceNumber || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gestorApp-gray-dark">
        {formatCurrency(calculateEntryTotal(entry))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end space-x-2">
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => onEdit(e, entry.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <DeleteConfirmDialog
              title="Eliminar Compra"
              description="Tem a certeza que deseja eliminar esta compra? Esta ação é irreversível e poderá afetar o stock."
              onDelete={() => onDelete(entry.id)}
              trigger={
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default StockEntryItem;
