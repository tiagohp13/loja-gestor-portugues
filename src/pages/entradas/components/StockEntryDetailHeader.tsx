import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

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

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Título da página */}
      <PageHeader title={`Compra: ${entryNumber}`} description="Detalhes da compra" />

      {/* Grupo de botões alinhado à direita */}
      <div className="flex flex-wrap justify-end gap-2">
        {/* Editar */}
        {!isDeleted && (
          <Button size="sm" onClick={() => navigate(`/entradas/editar/${id}`)}>
            Editar
          </Button>
        )}

        {/* Exportar PDF */}
        <Button variant="outline" size="sm" onClick={onExportPdf} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Exportar para PDF
        </Button>

        {/* ✅ Voltar à Lista (último e mais à direita) */}
        <Button
          variant="secondary"
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
