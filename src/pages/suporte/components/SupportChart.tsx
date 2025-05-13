
import React from 'react';
import ChartDropdown, { ChartType } from '@/components/statistics/ChartDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ResumoChart from '@/components/statistics/ResumoChart';
import MonthlyComparisonChart from '@/components/statistics/MonthlyComparisonChart';
import LowStockProductsTable from '@/components/statistics/LowStockProductsTable';
import TopEntitiesChart from '@/components/statistics/TopEntitiesChart';
import KpiMonthlyTable from './KpiMonthlyTable';

interface ChartData {
  monthlyData: any[];
  topProducts: any[];
  topClients: any[];
  topSuppliers: any[];
  lowStockProducts: any[];
  monthlyOrders: any[];
}

interface SupportChartProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  data: ChartData;
  isLoading: boolean;
  navigateToProduct: (id: string) => void;
  kpiMonthlyData?: { 
    roi: { month: Date; value: number }[];
    margemLucro: { month: Date; value: number }[];
    taxaConversao: { month: Date; value: number }[];
    valorMedioCompra: { month: Date; value: number }[];
    valorMedioVenda: { month: Date; value: number }[];
    lucroMedioVenda: { month: Date; value: number }[];
    lucroTotal: { month: Date; value: number }[];
    lucroPorCliente: { month: Date; value: number }[];
  };
}

const SupportChart: React.FC<SupportChartProps> = ({ 
  chartType, 
  setChartType, 
  data, 
  isLoading, 
  navigateToProduct,
  kpiMonthlyData = {
    roi: [],
    margemLucro: [],
    taxaConversao: [],
    valorMedioCompra: [],
    valorMedioVenda: [],
    lucroMedioVenda: [],
    lucroTotal: [],
    lucroPorCliente: []
  }
}) => {
  // Determine if the current chart type is a KPI type
  const isKpiType = [
    'roi', 'margemLucro', 'taxaConversao', 'valorMedioCompra', 
    'valorMedioVenda', 'lucroMedioVenda', 'lucroTotal', 'lucroPorCliente'
  ].includes(chartType);

  // Map KPI types to their display titles
  const kpiTitles: Record<string, string> = {
    roi: 'ROI',
    margemLucro: 'Margem de Lucro',
    taxaConversao: 'Taxa de Conversão',
    valorMedioCompra: 'Valor Médio de Compra',
    valorMedioVenda: 'Valor Médio de Venda',
    lucroMedioVenda: 'Lucro Médio por Venda',
    lucroTotal: 'Lucro Total',
    lucroPorCliente: 'Lucro por Cliente'
  };

  // Determine if KPI is percentage or currency
  const isPercentageKpi = ['roi', 'margemLucro', 'taxaConversao'].includes(chartType);
  const isCurrencyKpi = [
    'valorMedioCompra', 'valorMedioVenda', 'lucroMedioVenda', 
    'lucroTotal', 'lucroPorCliente'
  ].includes(chartType);

  const renderChart = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    // Handle KPI types
    if (isKpiType) {
      return (
        <KpiMonthlyTable
          title={kpiTitles[chartType]}
          data={kpiMonthlyData[chartType as keyof typeof kpiMonthlyData] || []}
          isPercentage={isPercentageKpi}
          isCurrency={isCurrencyKpi}
        />
      );
    }

    // Handle other chart types
    switch (chartType) {
      case 'resumo':
        return <ResumoChart data={data.monthlyData} />;
      case 'vendas':
        return <MonthlyComparisonChart data={data.monthlyData} dataKey="sales" chartTitle="Vendas Mensais" yAxisLabel="€" />;
      case 'compras':
        return <MonthlyComparisonChart data={data.monthlyData} dataKey="purchases" chartTitle="Compras Mensais" yAxisLabel="€" />;
      case 'lucro':
        return <MonthlyComparisonChart data={data.monthlyData} dataKey="profit" chartTitle="Lucro Mensal" yAxisLabel="€" />;
      case 'encomendas':
        return <MonthlyComparisonChart data={data.monthlyOrders} dataKey="completedExits" chartTitle="Encomendas Mensais" yAxisLabel="Quantidade" />;
      case 'stockMinimo':
        return <LowStockProductsTable products={data.lowStockProducts} navigateToProduct={navigateToProduct} />;
      default:
        return <ResumoChart data={data.monthlyData} />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Estatísticas</CardTitle>
        <ChartDropdown 
          currentType={chartType} 
          title="Selecionar Gráfico" 
          onSelect={setChartType} 
        />
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default SupportChart;
