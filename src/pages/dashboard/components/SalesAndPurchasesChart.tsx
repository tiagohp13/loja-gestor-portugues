
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';
import { useTheme } from '@/contexts/ThemeContext';

interface ChartDataItem {
  name: string;
  vendas: number;
  compras: number;
}

interface SalesAndPurchasesChartProps {
  chartData: ChartDataItem[];
}

const SalesAndPurchasesChart: React.FC<SalesAndPurchasesChartProps> = ({ chartData }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Cores adaptadas para modo escuro
  const colors = {
    grid: isDark ? 'hsl(217.2 32.6% 17.5%)' : '#f0f0f0',
    text: isDark ? 'hsl(210 40% 98%)' : '#374151',
    sales: '#3065ac',
    purchases: '#ff6961',
    tooltipBg: isDark ? 'hsl(222.2 84% 4.9%)' : '#ffffff',
    tooltipBorder: isDark ? 'hsl(217.2 32.6% 17.5%)' : '#e5e7eb'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="bg-card border border-border rounded-lg shadow-lg p-3"
          style={{ 
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder 
          }}
        >
          <p className="text-foreground font-medium">{`Período: ${label}`}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {`${item.name}: ${formatCurrency(item.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid}
              opacity={0.5}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: colors.text, fontSize: 12 }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
            <YAxis 
              tick={{ fill: colors.text, fontSize: 12 }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: colors.text }}
            />
            <Line 
              type="monotone" 
              dataKey="vendas" 
              stroke={colors.sales} 
              name="Vendas"
              strokeWidth={2}
              dot={{ fill: colors.sales, r: 4 }}
              activeDot={{ r: 6, fill: colors.sales }}
            />
            <Line 
              type="monotone" 
              dataKey="compras" 
              stroke={colors.purchases} 
              name="Compras"
              strokeWidth={2}
              dot={{ fill: colors.purchases, r: 4 }}
              activeDot={{ r: 6, fill: colors.purchases }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesAndPurchasesChart;
