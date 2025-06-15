
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

interface StockEntryEditHeaderProps {
  isNewEntry: boolean;
}

const StockEntryEditHeader: React.FC<StockEntryEditHeaderProps> = ({ isNewEntry }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/entradas/historico')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à Lista
      </Button>
      <PageHeader
        title={isNewEntry ? 'Nova Compra' : 'Editar Compra'}
        description={isNewEntry ? 'Criar uma nova compra de stock' : 'Modificar detalhes da compra'}
      />
    </div>
  );
};

export default StockEntryEditHeader;
