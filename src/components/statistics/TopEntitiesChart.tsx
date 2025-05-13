
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatting';

interface TopEntity {
  id: string;
  name: string;
  value: number;
  percentage?: number;
}

interface TopEntitiesChartProps {
  data: TopEntity[];
  title: string;
  isCurrency?: boolean;
}

const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#EF4444'];

const TopEntitiesChart: React.FC<TopEntitiesChartProps> = ({ 
  data, 
  title, 
  isCurrency = false 
}) => {
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Show only top 5
  
  // Calculate percentages if not already set
  if (sortedData.length > 0 && !sortedData[0].percentage) {
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);
    sortedData.forEach(item => {
      item.percentage = (item.value / total) * 100;
    });
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium mb-1">{data.name}</p>
          <p className="text-sm">
            {isCurrency ? formatCurrency(data.value) : data.value.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-gray-500">
            {data.percentage?.toFixed(1)}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Não existem dados para mostrar</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name} (${percentage?.toFixed(1)}%)`}
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopEntitiesChart;
