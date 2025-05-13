
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';

interface ResumoChartProps {
  data: Array<{
    month: string;
    sales: number;
    purchases: number;
    profit: number;
  }>;
}

const ResumoChart: React.FC<ResumoChartProps> = ({ data }) => {
  // Ensure data is sorted by date (assuming month format is YYYY-MM)
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  }).slice(-6); // Show only last 6 months

  // Format month display for X-axis
  const formatMonth = (month: string) => {
    const date = new Date(month);
    return date.toLocaleString('pt-BR', { month: 'short' });
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium mb-1">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name === 'sales' && 'Vendas: '}
              {entry.name === 'purchases' && 'Compras: '}
              {entry.name === 'profit' && 'Lucro: '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 pb-1">
        <h3 className="text-lg font-medium mb-4">Resumo Financeiro</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickFormatter={formatMonth}
              />
              <YAxis 
                tickFormatter={(value) => `€${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sales" name="Vendas" fill="#4F46E5" />
              <Bar dataKey="purchases" name="Compras" fill="#EF4444" />
              <Bar dataKey="profit" name="Lucro" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumoChart;
