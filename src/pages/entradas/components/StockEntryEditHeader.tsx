
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';

interface StockEntryEditHeaderProps {
  isNewEntry: boolean;
}

const StockEntryEditHeader: React.FC<StockEntryEditHeaderProps> = ({ isNewEntry }) => {
  const navigate = useNavigate();
  
  return (
    <PageHeader 
      title={isNewEntry ? "Nova Entrada de Stock" : "Editar Entrada de Stock"} 
      description={isNewEntry 
        ? "Registe uma nova entrada de produtos no stock" 
        : "Atualize os detalhes da entrada de stock"
      } 
      actions={
        <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
          Voltar ao Histórico
        </Button>
      }
    />
  );
};

export default StockEntryEditHeader;
