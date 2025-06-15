
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

interface StockEntryDetailHeaderProps {
  entryNumber: string;
  id: string;
  onExportPdf: () => void;
}

const StockEntryDetailHeader: React.FC<StockEntryDetailHeaderProps> = ({
  entryNumber,
  id,
  onExportPdf
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          title={`Compra: ${entryNumber}`}
          description="Detalhes da compra"
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Exportar para PDF
        </Button>
        <Button
          size="sm"
          onClick={() => navigate(`/entradas/editar/${id}`)}
        >
          Editar
        </Button>
      </div>
    </div>
  );
};

export default StockEntryDetailHeader;
