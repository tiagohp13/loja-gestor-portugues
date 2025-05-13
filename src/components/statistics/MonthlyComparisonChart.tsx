
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';

interface MonthlyComparisonChartProps {
  data: Array<{
    month: string;
    [key: string]: any;
  }>;
  dataKey: string;
  chartTitle: string;
  yAxisLabel?: string;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  data,
  dataKey,
  chartTitle,
  yAxisLabel = ''
}) => {
  // Ensure data is sorted by date (assuming month format is YYYY-MM)
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  }).slice(-12); // Show only last 12 months

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
              {yAxisLabel === '€' 
                ? formatCurrency(entry.value)
                : `${entry.value.toLocaleString('pt-BR')} ${yAxisLabel}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getLineColor = () => {
    switch(dataKey) {
      case 'sales': return '#4F46E5'; // Blue
      case 'purchases': return '#EF4444'; // Red
      case 'profit': return '#10B981'; // Green
      case 'completedExits': return '#F59E0B'; // Amber
      default: return '#6366F1'; // Indigo
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 pb-1">
        <h3 className="text-lg font-medium mb-4">{chartTitle}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickFormatter={formatMonth}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (yAxisLabel === '€') {
                    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${yAxisLabel}`;
                  }
                  return `${value.toLocaleString('pt-BR')}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={getLineColor()} 
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyComparisonChart;
