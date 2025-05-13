
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StockEntryEditActionsProps {
  isSubmitting: boolean;
}

const StockEntryEditActions: React.FC<StockEntryEditActionsProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  
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
      <Button 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'A guardar...' : 'Guardar Entrada'}
      </Button>
    </div>
  );
};

export default StockEntryEditActions;
