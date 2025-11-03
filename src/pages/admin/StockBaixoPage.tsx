import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StockBaixoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Stock Baixo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Esta página irá listar todos os produtos abaixo do stock mínimo, com
            opção de exportar PDF e enviar para fornecedores.
          </p>
          <Button onClick={() => navigate("/produtos/consultar")}>
            Voltar aos Produtos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockBaixoPage;
