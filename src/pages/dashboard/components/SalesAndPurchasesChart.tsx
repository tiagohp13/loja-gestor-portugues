import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ResponsiveContainer
} from 'recharts';
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
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-100">
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#D1D5DB" strokeOpacity={0.2} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={false}
                tick={{ fill: '#374151', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#374151', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: 4, border: '1px solid #E5E7EB' }}
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Período: ${label}`}
              />
-              <Legend
-                verticalAlign="bottom"
-                height={36}
-                wrapperStyle={{ fontSize: 12, color: '#6B7280' }}
-              />
+              <Legend
+                verticalAlign="bottom"
+                height={36}
+                wrapperStyle={{ fontSize: 14, color: '#6B7280' }}
+              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="#2563EB" 
                name="Vendas" 
                dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="compras" 
                stroke="#EF4444" 
                name="Compras" 
                dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesAndPurchasesChart;
