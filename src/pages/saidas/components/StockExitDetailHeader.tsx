
import React from 'react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FilePdf } from 'lucide-react';

type StockExitDetailHeaderProps = {
  exitNumber: string;
  id: string;
  onNavigateBack: (path: string) => void;
  onExportPdf: () => void;
};

const StockExitDetailHeader: React.FC<StockExitDetailHeaderProps> = ({ 
  exitNumber, 
  id, 
  onNavigateBack,
  onExportPdf
}) => {
  return (
    <PageHeader
      title={`Venda: ${exitNumber || ''}`}
      description="Detalhes da venda"
      actions={
        <>
          <Button onClick={onExportPdf} variant="outline">
            <FilePdf className="mr-2 h-4 w-4" />
            Exportar para PDF
          </Button>
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
