import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { usePermissions } from "@/hooks/usePermissions";

interface StockEntryDetailHeaderProps {
  entryNumber: string;
  id: string;
  onExportPdf: () => void;
  isDeleted?: boolean;
}

const StockEntryDetailHeader: React.FC<StockEntryDetailHeaderProps> = ({
  entryNumber,
  id,
  onExportPdf,
  isDeleted = false,
}) => {
  const navigate = useNavigate();
  const { canEdit } = usePermissions();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Título */}
      <PageHeader title={`Compra: ${entryNumber}`} description="Detalhes da compra" />

      {/* Grupo de botões alinhados à direita */}
      <div className="flex flex-wrap justify-end gap-2">
        {/* PDF (vermelho Adobe autêntico) */}
        <Button
          size="sm"
          onClick={onExportPdf}
          className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
        >
          <FileText className="h-4 w-4" />
          PDF
        </Button>

        {/* Editar (mantém cor padrão) */}
        {!isDeleted && canEdit && (
          <Button size="sm" onClick={() => navigate(`/entradas/editar/${id}`)}>
            Editar
          </Button>
        )}

        {/* Voltar à Lista (branco/outline) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/entradas/historico")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Lista
        </Button>
      </div>
    </div>
  );
};

export default StockEntryDetailHeader;
