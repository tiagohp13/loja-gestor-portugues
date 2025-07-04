
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';

interface ExpenseFormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

const ExpenseFormActions: React.FC<ExpenseFormActionsProps> = ({ isLoading, onCancel }) => {
  const { canCreate, canEdit } = usePermissions();
  
  return (
    <div className="flex gap-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      {(canCreate || canEdit) && (
        <Button type="submit" disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'A guardar...' : 'Guardar Despesa'}
        </Button>
      )}
    </div>
  );
};

export default ExpenseFormActions;
