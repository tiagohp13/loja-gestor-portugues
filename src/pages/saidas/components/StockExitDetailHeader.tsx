import React from "react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import { FileText, Pencil, ArrowLeft } from "lucide-react";

type StockExitDetailHeaderProps = {
  exitNumber: string;
  id: string;
  onNavigateBack: (path: string) => void;
  onExportPdf: () => void;
  isDeleted?: boolean;
};

const StockExitDetailHeader: React.FC<StockExitDetailHeaderProps> = ({
  exitNumber,
  id,
  onNavigateBack,
  onExportPdf,
  isDeleted = false,
}) => {
  return (
    <PageHeader
      title={`Venda: ${exitNumber || ""}`}
      description="Detalhes da venda"
      actions={
        <>
          {/* PDF (vermelho Adobe autêntico) */}
          <Button onClick={onExportPdf} className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white">
            <FileText className="h-4 w-4" />
            PDF
          </Button>

          {/* Editar */}
          {!isDeleted && (
            <Button onClick={() => onNavigateBack(`/saidas/editar/${id}`)}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}

          {/* Voltar à Lista */}
          <Button
            variant="outline"
            onClick={() => onNavigateBack("/saidas/historico")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à Lista
          </Button>
        </>
      }
    />
  );
};

export default StockExitDetailHeader;
