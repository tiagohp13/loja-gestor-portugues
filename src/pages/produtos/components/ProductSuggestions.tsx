import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, Info, CheckCircle } from "lucide-react";

interface ProductSuggestionsProps {
  totalUnitsSoldLast30: number;
  lastEntryDate?: string;
  currentStock: number;
  minStock: number;
  salePrice: number;
  averageCost?: number;
}

const ProductSuggestions: React.FC<ProductSuggestionsProps> = ({
  totalUnitsSoldLast30,
  lastEntryDate,
  currentStock,
  minStock,
  salePrice,
  averageCost,
}) => {
  const suggestions: React.ReactNode[] = [];

  const daysSince = lastEntryDate
    ? Math.floor((Date.now() - new Date(lastEntryDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const rotationRate = currentStock > 0 ? (totalUnitsSoldLast30 / currentStock) * 100 : 0;

  let hasWarning = false;

  // 1️⃣ Sem vendas
  if (totalUnitsSoldLast30 === 0 && currentStock > 0) {
    suggestions.push(
      <Alert key="no-sales" variant="default">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          Este produto <strong>não teve vendas</strong> nas últimas 4 semanas. Considere promover ou ajustar o preço.
        </AlertDescription>
      </Alert>,
    );
    hasWarning = true;
  }

  // 2️⃣ Stock parado
  if (daysSince && daysSince > 90 && currentStock > 0 && rotationRate < 20) {
    suggestions.push(
      <Alert key="stale-stock" variant="default">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          Última entrada há <strong>{daysSince}</strong> dias e vendas baixas ({rotationRate.toFixed(1)}%).{" "}
          <strong>Atenção a possível excesso de stock.</strong>
        </AlertDescription>
      </Alert>,
    );
    hasWarning = true;
  }

  // 3️⃣ Alta rotatividade
  if (!hasWarning && totalUnitsSoldLast30 > minStock) {
    suggestions.push(
      <Alert key="fast-mover" variant="default">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Vendeu <strong>{totalUnitsSoldLast30}</strong> unidades no último mês — boa rotação ({rotationRate.toFixed(1)}
          %). <strong>Considere aumentar o stock mínimo.</strong>
        </AlertDescription>
      </Alert>,
    );
  }

  // 4️⃣ Margem baixa
  if (averageCost && salePrice) {
    const profitMargin = ((salePrice - averageCost) / averageCost) * 100;
    if (profitMargin < 15) {
      suggestions.push(
        <Alert key="low-margin" variant="default">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <AlertDescription>
            Margem de lucro <strong>baixa ({profitMargin.toFixed(1)}%)</strong>.
            <strong> Reveja o preço sugerido.</strong>
          </AlertDescription>
        </Alert>,
      );
    }
  }

  // 5️⃣ Feedback equilibrado (com bom senso)
  if (suggestions.length === 0) {
    if (totalUnitsSoldLast30 === 0) {
      suggestions.push(
        <Alert key="no-sales-feedback" variant="default">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            Nenhuma venda no último mês — <strong>avalie estratégias para aumentar a procura.</strong>
          </AlertDescription>
        </Alert>,
      );
    } else if (totalUnitsSoldLast30 < 4) {
      suggestions.push(
        <Alert key="low-sales-feedback" variant="default">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Apenas <strong>{totalUnitsSoldLast30}</strong> vendas no último mês.
            <strong> Acompanhe o desempenho.</strong>
          </AlertDescription>
        </Alert>,
      );
    } else if (totalUnitsSoldLast30 >= 4 && totalUnitsSoldLast30 < 20) {
      suggestions.push(
        <Alert key="balanced-feedback" variant="default">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Produto com desempenho equilibrado — vendeu <strong>{totalUnitsSoldLast30}</strong> unidades no último mês.{" "}
            <strong>Continue o bom trabalho!</strong>
          </AlertDescription>
        </Alert>,
      );
    } else {
      suggestions.push(
        <Alert key="excellent-feedback" variant="default">
          <TrendingUp className="h-4 w-4 text-green-700" />
          <AlertDescription>
            Produto com <strong>excelente performance!</strong> — vendeu <strong>{totalUnitsSoldLast30}</strong>{" "}
            unidades no último mês. <strong>Mantenha o ritmo!</strong>
          </AlertDescription>
        </Alert>,
      );
    }
  }

  return <div className="space-y-2 mt-4">{suggestions}</div>;
};

export default ProductSuggestions;
