import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Download, Edit } from "lucide-react";

interface StockEntryDetailHeaderProps {
  entryNumber: string;
  id: string;
  onExportPdf: () => void;
  isDeleted: boolean;
}

const StockEntryDetailHeader: React.FC<StockEntryDetailHeaderProps> = ({ entryNumber, id, onExportPdf, isDeleted }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Compra: {entryNumber || "Sem número"}</h1>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {/* Botões principais alinhados à direita */}
        {!isDeleted && (
          <Button variant="default" onClick={() => navigate(`/entradas/${id}/editar`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}

        <Button variant="outline" onClick={onExportPdf}>
          <Download className="w-4 h-4 mr-2" />
          Exportar para PDF
        </Button>

        {/* ✅ Botão Voltar à Lista (último e alinhado à direita) */}
        <Button variant="secondary" onClick={() => navigate("/entradas")} className="ml-auto">
          ← Voltar à Lista
        </Button>
      </div>
    </div>
  );
};

export default StockEntryDetailHeader;
