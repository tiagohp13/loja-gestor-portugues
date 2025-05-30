
import React from 'react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, Pencil } from 'lucide-react';

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
            <FileText className="h-4 w-4 text-red-500" />
            Exportar para PDF
          </Button>
          <Button 
            variant="secondary"
            onClick={() => onNavigateBack(`/saidas/editar/${id}`)}
          >
            <Pencil className="h-4 w-4" />
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
