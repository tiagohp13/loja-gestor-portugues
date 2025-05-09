
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CircleOff } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import ChartDropdown, { ChartType } from '@/components/statistics/ChartDropdown';

interface SupportChartProps {
  chartType: ChartType;
  setChartType: React.Dispatch<React.SetStateAction<ChartType>>;
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
  chartType, 
  setChartType, 
  data, 
  isLoading,
  navigateToProduct 
}) => {
  
  const renderChart = () => {
    if (isLoading) return <div className="flex justify-center items-center py-20">Carregando...</div>;

    switch(chartType) {
      case 'resumo':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Resumo Financeiro (6 meses)" 
                  onSelect={setChartType} 
                />
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
          </>
        );
      
      case 'vendas':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Vendas Mensais" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Valores de vendas em euros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="vendas" fill="#3065ac" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'compras':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Compras Mensais" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Valores de compras em euros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="compras" fill="#ff6961" name="Compras" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'lucro':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Lucro Mensal" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Valores de lucro em euros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="lucro" fill="#bdecb6" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        );
      
      case 'produtos':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Produtos com mais movimento" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Top 5 produtos mais vendidos</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={data.topProducts}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de produtos disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'stockMinimo':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Produtos com Stock Mínimo" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Produtos que estão abaixo do stock mínimo definido</CardDescription>
            </CardHeader>
            <CardContent>
              {data.lowStockProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Produto</th>
                        <th className="py-2 text-right">Stock Atual</th>
                        <th className="py-2 text-right">Stock Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigateToProduct(product.id)}>
                          <td className="py-2 text-left text-blue-600">{product.name}</td>
                          <td className="py-2 text-right font-medium text-red-500">{product.current_stock}</td>
                          <td className="py-2 text-right">{product.min_stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há produtos com stock baixo</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'clientes':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Clientes com mais compras" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Top 5 clientes por número de compras</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topClients.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={data.topClients.map(c => ({ name: c.name, value: c.orders }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de clientes disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'fornecedores':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Fornecedores mais usados" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Top 5 fornecedores por número de entradas</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topSuppliers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={data.topSuppliers.map(s => ({ name: s.name, value: s.entries }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de fornecedores disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      case 'encomendas':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <ChartDropdown 
                  currentType={chartType} 
                  title="Encomendas Mensais" 
                  onSelect={setChartType} 
                />
              </CardTitle>
              <CardDescription>Encomendas pendentes e concluídas nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {data.monthlyOrders.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pendentes" fill="#3065ac" name="Encomendas Pendentes" />
                    <Bar dataKey="concluidas" fill="#bdecb6" name="Encomendas Concluídas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <CircleOff className="mx-auto h-8 w-8 mb-2" />
                  <p>Não há dados de encomendas disponíveis</p>
                </div>
              )}
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      {renderChart()}
    </Card>
  );
};

export default SupportChart;
