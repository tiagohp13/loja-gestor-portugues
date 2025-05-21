
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CircleOff } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { ChartType } from '@/components/statistics/ChartDropdown';
import ChartDropdown from '@/components/statistics/ChartDropdown';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SupportChartProps {
  chartType: ChartType;
  data: {
    monthlyData: any[];
    topProducts: Array<{ name: string; quantity: number }>;
    topClients: Array<{ name: string; orders: number }>;
    topSuppliers: Array<{ name: string; entries: number }>;
    lowStockProducts: any[];
    monthlyOrders: any[];
  };
  isLoading: boolean;
  navigateToProduct: (id: string) => void;
}

const SupportChart: React.FC<SupportChartProps> = ({ 
  data, 
  chartType,
  isLoading,
  navigateToProduct 
}) => {
  const [currentChartType, setCurrentChartType] = useState<ChartType>(chartType || 'resumo');
  
  if (isLoading) return <div className="flex justify-center items-center py-20">Carregando...</div>;
  
  // Check if we have the necessary data
  const hasMonthlyData = data.monthlyData && data.monthlyData.length > 0;
  
  if (!hasMonthlyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Resumo Financeiro
            <ChartDropdown
              currentType={currentChartType}
              title="Selecionar Gráfico"
              onSelect={setCurrentChartType}
            />
          </CardTitle>
          <CardDescription>Não há dados disponíveis para exibir no gráfico</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-20">
          <CircleOff className="h-16 w-16 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Sem dados para exibir</p>
        </CardContent>
      </Card>
    );
  }

  // Configure chart based on the selected chartType
  const renderChart = () => {
    switch (currentChartType) {
      case 'resumo':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar name="Vendas" dataKey="vendas" fill="#3065ac" />
              <Bar name="Compras" dataKey="compras" fill="#ff6961" />
              <Bar name="Lucro" dataKey="lucro" fill="#bdecb6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'vendas':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" name="Vendas" dataKey="vendas" stroke="#3065ac" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      // Add remaining chart types as needed
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar name="Vendas" dataKey="vendas" fill="#3065ac" />
              <Bar name="Compras" dataKey="compras" fill="#ff6961" />
              <Bar name="Lucro" dataKey="lucro" fill="#bdecb6" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Resumo Financeiro
          <ChartDropdown
            currentType={currentChartType}
            title="Selecionar Gráfico"
            onSelect={setCurrentChartType}
          />
        </CardTitle>
        <CardDescription>Comparação entre vendas, gastos e lucro dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default SupportChart;
