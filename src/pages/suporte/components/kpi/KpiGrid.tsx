
import React from 'react';
import { SupportStats } from '../../types/supportTypes';
import KpiCard from './KpiCard';
import { useKpiCalculations } from '../../hooks/useKpiCalculations';
import { BadgeDollarSign, BadgePercent, Coins, Wallet, Users, Euro, Tag } from 'lucide-react';

interface KpiGridProps {
  stats: SupportStats;
}

const KpiGrid: React.FC<KpiGridProps> = ({ stats }) => {
  const kpiMetrics = useKpiCalculations(stats);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <KpiCard
        title="ROI"
        value={kpiMetrics.roi}
        icon={<BadgePercent className="h-5 w-5" />}
        tooltipText="Retorno sobre o investimento"
        isPercentage={true}
        iconColor="text-purple-500"
        iconBackground="bg-purple-100"
      />
      
      <KpiCard
        title="Margem de Lucro"
        value={kpiMetrics.profitMargin}
        icon={<Tag className="h-5 w-5" />}
        tooltipText="Margem de lucro sobre as vendas"
        isPercentage={true}
        iconColor="text-green-500"
        iconBackground="bg-green-100"
      />
      
      <KpiCard
        title="Taxa de Conversão"
        value={kpiMetrics.salesConversionRate}
        icon={<BadgeDollarSign className="h-5 w-5" />}
        tooltipText="Taxa de conversão de clientes em vendas"
        isPercentage={true}
        iconColor="text-orange-500"
        iconBackground="bg-orange-100"
      />
      
      <KpiCard
        title="Valor Médio de Compra"
        value={kpiMetrics.averagePurchaseValue}
        icon={<Wallet className="h-5 w-5" />}
        tooltipText="Valor médio gasto em cada compra"
        iconColor="text-indigo-500"
        iconBackground="bg-indigo-100"
      />
      
      <KpiCard
        title="Valor Médio de Venda"
        value={kpiMetrics.averageSaleValue}
        icon={<Coins className="h-5 w-5" />}
        tooltipText="Valor médio recebido em cada venda"
        iconColor="text-blue-500"
        iconBackground="bg-blue-100"
      />
      
      <KpiCard
        title="Lucro Médio por Venda"
        value={kpiMetrics.averageProfitPerSale}
        icon={<Euro className="h-5 w-5" />}
        tooltipText="Lucro médio gerado em cada venda"
        iconColor="text-emerald-500"
        iconBackground="bg-emerald-100"
      />
      
      <KpiCard
        title="Lucro Total"
        value={kpiMetrics.totalProfit}
        icon={<Coins className="h-5 w-5" />}
        tooltipText="Lucro total gerado no período"
        iconColor="text-amber-500"
        iconBackground="bg-amber-100"
      />
      
      <KpiCard
        title="Lucro por Cliente"
        value={kpiMetrics.profitPerClient}
        icon={<Users className="h-5 w-5" />}
        tooltipText="Lucro médio gerado por cada cliente"
        iconColor="text-rose-500"
        iconBackground="bg-rose-100"
      />
    </div>
  );
};

export default KpiGrid;
