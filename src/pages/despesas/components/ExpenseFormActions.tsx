
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface ExpenseFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

const ExpenseFormActions: React.FC<ExpenseFormActionsProps> = ({ isLoading, onCancel }) => {
  return (
    <div className="flex gap-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading}>
        <Save className="w-4 h-4 mr-2" />
        {isLoading ? 'A guardar...' : 'Guardar Despesa'}
      </Button>
    </div>
  );
};

export default ExpenseFormActions;
