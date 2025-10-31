import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Pencil, FileText, ArrowLeft } from "lucide-react";

interface ProductDetailHeaderProps {
  productName: string;
  productCode: string;
  productId: string;
  isDeleted?: boolean;
  onExportPdf?: () => void;
}

const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  productName,
  productCode,
  productId,
  isDeleted = false,
  onExportPdf,
}) => {
  const navigate = useNavigate();

  return (
    <PageHeader
      title={productName}
      description={`Código: ${productCode}`}
      actions={
        <div className="flex items-center gap-2">
          {/* Botão PDF (vermelho Adobe) */}
          {onExportPdf && (
            <Button
              size="sm"
              onClick={onExportPdf}
              className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          )}

          {/* Botão Editar */}
          {!isDeleted && (
            <Button size="sm" onClick={() => navigate(`/produtos/editar/${productId}`)}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}

          {/* Botão Voltar ao Catálogo */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/produtos/consultar")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Catálogo
          </Button>
        </div>
      }
    />
  );
};

export default ProductDetailHeader;
