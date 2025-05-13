
import React from 'react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';

type StockExitDetailHeaderProps = {
  exitNumber: string;
  id: string;
  onNavigateBack: (path: string) => void;
};

const StockExitDetailHeader: React.FC<StockExitDetailHeaderProps> = ({ 
  exitNumber, 
  id, 
  onNavigateBack 
}) => {
  return (
    <PageHeader
      title={`Venda: ${exitNumber || ''}`}
      description="Detalhes da venda"
      actions={
        <>
          <Button onClick={() => onNavigateBack(`/saidas/editar/${id}`)}>
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigateBack('/saidas/historico')}
          >
            Voltar à Lista
          </Button>
        </>
      }
    />
  );
};

export default StockExitDetailHeader;
