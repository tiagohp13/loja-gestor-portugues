import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface StockEntryEditHeaderProps {
  isNewEntry: boolean;
}

const StockEntryEditHeader: React.FC<StockEntryEditHeaderProps> = ({ isNewEntry }) => {
  const navigate = useNavigate();

  const handleCancel = () => navigate("/entradas/historico");
  const handleSave = () => {
    // o botão chama o submit do formulário dentro de StockEntryEditForm via evento global
    const form = document.querySelector("form");
    if (form) form.requestSubmit();
  };

  return (
    <PageHeader
      title={isNewEntry ? "Nova Compra" : "Editar Compra"}
      description={isNewEntry ? "Criar uma nova compra de stock" : "Modificar detalhes da compra"}
      actions={
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {isNewEntry ? "Guardar Compra" : "Guardar Alterações"}
          </Button>
        </div>
      }
    />
  );
};

export default StockEntryEditHeader;
