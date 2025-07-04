
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface StockEntryEditActionsProps {
  isSubmitting: boolean;
}

const StockEntryEditActions: React.FC<StockEntryEditActionsProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermissions();
  
  return (
    <div className="flex justify-end space-x-4">
      <Button 
        variant="outline" 
        type="button" 
        onClick={() => navigate('/entradas/historico')}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      {(canCreate || canEdit) && (
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'A guardar...' : 'Guardar Entrada'}
        </Button>
      )}
    </div>
  );
};

export default StockEntryEditActions;
