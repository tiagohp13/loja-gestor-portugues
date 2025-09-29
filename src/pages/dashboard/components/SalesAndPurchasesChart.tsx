
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';
import { useTheme } from '@/contexts/ThemeContext';
import ChartSkeleton from '@/components/ui/ChartSkeleton';

interface ChartDataItem {
  name: string;
  vendas: number;
  compras: number;
}

interface SalesAndPurchasesChartProps {
  chartData: ChartDataItem[];
  isLoading?: boolean;
}

const SalesAndPurchasesChart: React.FC<SalesAndPurchasesChartProps> = ({ chartData, isLoading = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Cores com melhor contraste WCAG AA - restaurando cores originais
  const colors = {
    grid: isDark ? 'hsl(217.2 32.6% 25%)' : 'hsl(210 40% 90%)',
    text: isDark ? 'hsl(210 40% 95%)' : 'hsl(222.2 84% 15%)',
    sales: isDark ? '#60a5fa' : '#2563eb', // Azul para vendas
    purchases: isDark ? '#f87171' : '#dc2626', // Vermelho para compras
    tooltipBg: isDark ? 'hsl(222.2 84% 8%)' : 'hsl(0 0% 98%)',
    tooltipBorder: isDark ? 'hsl(217.2 32.6% 25%)' : 'hsl(214.3 31.8% 85%)'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentData = chartData.find(item => item.name === label);
      const currentIndex = chartData.findIndex(item => item.name === label);
      const previousData = currentIndex > 0 ? chartData[currentIndex - 1] : null;
      
      return (
        <div 
          className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[250px]"
          style={{ 
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.1)'
          }}
        >
          <p className="text-foreground font-semibold mb-2 text-base">{`Período: ${label}`}</p>
          {payload.map((item: any, index: number) => {
            const isVendas = item.dataKey === 'vendas';
            const currentValue = item.value;
            const previousValue = previousData ? (isVendas ? previousData.vendas : previousData.compras) : 0;
            const variation = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
            
            return (
              <div key={index} className="mb-2 last:mb-0">
                <p className="text-sm font-medium" style={{ color: item.color }}>
                  {`${item.name}: ${formatCurrency(item.value)}`}
                </p>
                {previousValue > 0 && (
                  <p className={`text-xs ${variation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {variation >= 0 ? '↗' : '↘'} {Math.abs(variation).toFixed(1)}% vs mês anterior
                  </p>
                )}
              </div>
            );
          })}
          
          {currentData && (
            <div className="border-t border-border mt-2 pt-2">
              <p className="text-xs text-muted-foreground">
                Lucro: {formatCurrency(currentData.vendas - currentData.compras)}
              </p>
              <p className="text-xs text-muted-foreground">
                Margem: {currentData.vendas > 0 ? (((currentData.vendas - currentData.compras) / currentData.vendas) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center mt-4 space-x-6">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 mr-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Show loading state
  if (isLoading || !chartData || chartData.length === 0) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground text-xl font-semibold">Resumo Financeiro</CardTitle>
        <p className="text-muted-foreground text-sm">Evolução mensal de vendas, compras e tendências</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid}
              opacity={0.6}
              strokeWidth={1}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: colors.text, fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: colors.grid, strokeWidth: 1 }}
              tickLine={{ stroke: colors.grid, strokeWidth: 1 }}
              height={60}
            />
            <YAxis 
              tick={{ fill: colors.text, fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: colors.grid, strokeWidth: 1 }}
              tickLine={{ stroke: colors.grid, strokeWidth: 1 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Line 
              type="monotone" 
              dataKey="vendas" 
              stroke={colors.sales} 
              name="Vendas"
              strokeWidth={3}
              dot={{ fill: colors.sales, r: 5, strokeWidth: 2, stroke: isDark ? '#000' : '#fff' }}
              activeDot={{ r: 7, fill: colors.sales, strokeWidth: 2, stroke: isDark ? '#000' : '#fff' }}
              connectNulls={false}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="compras" 
              stroke={colors.purchases} 
              name="Compras"
              strokeWidth={3}
              dot={{ fill: colors.purchases, r: 5, strokeWidth: 2, stroke: isDark ? '#000' : '#fff' }}
              activeDot={{ r: 7, fill: colors.purchases, strokeWidth: 2, stroke: isDark ? '#000' : '#fff' }}
              connectNulls={false}
              animationDuration={1500}
              animationEasing="ease-out"
              animationBegin={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesAndPurchasesChart;
