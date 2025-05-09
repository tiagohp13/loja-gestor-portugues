
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

interface CategoryDataItem {
  name: string;
  quantidade: number;
}

interface ProductCategoryChartProps {
  categoryData: CategoryDataItem[];
}

const ProductCategoryChart: React.FC<ProductCategoryChartProps> = ({ categoryData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value} produto(s)`, '']}
              labelFormatter={(label) => `Categoria: ${label}`} 
            />
            <Legend />
            <Bar dataKey="quantidade" fill="#1a56db" name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProductCategoryChart;
