
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';

interface ChartDataItem {
  name: string;
  vendas: number;
  compras: number;
  lucro: number;
}

interface SalesAndPurchasesChartProps {
  chartData: ChartDataItem[];
}

const SalesAndPurchasesChart: React.FC<SalesAndPurchasesChartProps> = ({ chartData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Período: ${label}`} 
            />
            <Legend />
            <Bar dataKey="vendas" fill="#3065ac" name="Vendas" />
            <Bar dataKey="compras" fill="#ff6961" name="Compras" />
            <Bar dataKey="lucro" fill="#bdecb6" name="Lucro" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesAndPurchasesChart;
