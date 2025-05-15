
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';

interface ChartDataItem {
  name: string;
  vendas: number;
  compras: number;
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
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Período: ${label}`} 
            />
            <Legend />
            <Line type="monotone" dataKey="vendas" stroke="#3065ac" name="Vendas" />
            <Line type="monotone" dataKey="compras" stroke="#ff6961" name="Compras" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesAndPurchasesChart;
