
import React from 'react';
import { useKpiCalculations } from '../../hooks/useKpiCalculations';
import { SupportStats } from '../../types/supportTypes';
import KpiCard from './KpiCard';

interface KpiGridProps {
  stats: SupportStats;
}

const KpiGrid: React.FC<KpiGridProps> = ({ stats }) => {
  const kpis = useKpiCalculations(stats);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="ROI"
        value={kpis.roi}
        suffix="%"
        description="Retorno sobre o Investimento"
      />
      
      <KpiCard
        title="Margem de Lucro"
        value={kpis.profitMargin}
        suffix="%"
        description="Lucro / Vendas"
      />
      
      <KpiCard
        title="Taxa de Conversão"
        value={kpis.salesConversionRate}
        suffix="%"
        description="Vendas / Clientes"
      />
      
      <KpiCard
        title="Compra Média"
        value={kpis.averagePurchaseValue}
        prefix="€"
        description="Valor médio por compra"
      />
      
      <KpiCard
        title="Venda Média"
        value={kpis.averageSaleValue}
        prefix="€"
        description="Valor médio por venda"
      />
      
      <KpiCard
        title="Lucro Total"
        value={kpis.totalProfit}
        prefix="€"
        description="Vendas - Compras"
      />
      
      <KpiCard
        title="Lucro por Venda"
        value={kpis.averageProfitPerSale}
        prefix="€"
        description="Lucro / Número de vendas"
      />
      
      <KpiCard
        title="Lucro por Cliente"
        value={kpis.profitPerClient}
        prefix="€"
        description="Lucro / Número de clientes"
      />
    </div>
  );
};

export default KpiGrid;
