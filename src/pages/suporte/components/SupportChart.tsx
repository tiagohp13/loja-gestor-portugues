
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CircleOff } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { ChartType } from '@/components/statistics/ChartDropdown';

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
  isLoading,
  navigateToProduct 
}) => {
  
  if (isLoading) return <div className="flex justify-center items-center py-20">Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Resumo Financeiro (6 meses)
        </CardTitle>
        <CardDescription>Comparação entre vendas, gastos e lucro dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default SupportChart;
