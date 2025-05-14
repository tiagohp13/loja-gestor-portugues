
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { FileText } from 'lucide-react';

type StockEntryDetailHeaderProps = {
  entryNumber: string;
  id: string;
  onExportPdf: () => void;
};

const StockEntryDetailHeader: React.FC<StockEntryDetailHeaderProps> = ({ 
  entryNumber, 
  id, 
  onExportPdf 
}) => {
  const navigate = useNavigate();
  
  return (
    <PageHeader
      title={`Compra: ${entryNumber || ''}`}
      description="Detalhes da compra de stock"
      actions={
        <>
          <Button 
            variant="outline"
            onClick={onExportPdf}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar para PDF
          </Button>
          <Button
            onClick={() => navigate(`/entradas/editar/${id}`)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/entradas/historico')}
          >
            Voltar à Lista
          </Button>
        </>
      }
    />
  );
};

export default StockEntryDetailHeader;
