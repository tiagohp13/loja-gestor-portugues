
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../hooks/useSupportData';
import { 
  TrendingUp, 
  BarChart, 
  PieChart, 
  Calculator,
  DollarSign,
  Percent,
  Users,
  ShoppingCart,
  Coins
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OperationsSummaryProps {
  stats: SupportStats;
}

const OperationsSummary: React.FC<OperationsSummaryProps> = ({ stats }) => {
  // Calcular KPIs com base nos dados existentes
  const completedExitsCount = stats.monthlyOrders.reduce((sum, month) => sum + month.completedExits, 0);
  const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
  
  // ROI (Retorno sobre o Investimento) = (Lucro / Valor de Compras) × 100
  const roi = stats.totalSpent > 0 ? (stats.profit / stats.totalSpent) * 100 : 0;
  
  // Margem de Lucro = (Lucro / Valor de Vendas) × 100
  const profitMargin = stats.profitMargin; // Já calculado no sistema
  
  // Taxa de Conversão de Vendas = (Número de Vendas / Número de Clientes) × 100
  const salesConversionRate = stats.clientsCount > 0 ? (completedExitsCount / stats.clientsCount) * 100 : 0;
  
  // Valor Médio de Compra = Valor de Compras / Número de Compras
  const averagePurchaseValue = totalEntries > 0 ? stats.totalSpent / totalEntries : 0;
  
  // Valor Médio de Venda = Valor de Vendas / Número de Vendas
  const averageSaleValue = completedExitsCount > 0 ? stats.totalSales / completedExitsCount : 0;
  
  // Lucro Total = Valor de Vendas - Valor de Compras
  const totalProfit = stats.profit; // Já calculado no sistema
  
  // Lucro Médio por Venda = Lucro / Número de Vendas
  const averageProfitPerSale = completedExitsCount > 0 ? stats.profit / completedExitsCount : 0;
  
  // Lucro por Cliente = Lucro / Número de Clientes
  const profitPerClient = stats.clientsCount > 0 ? stats.profit / stats.clientsCount : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores Operacionais</CardTitle>
        <CardDescription>KPIs calculados com base nos dados do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* ROI */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    <h3 className="text-sm font-medium">ROI</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">(Lucro / Valor de Compras) × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatPercentage(roi)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Margem de Lucro */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Percent className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="text-sm font-medium">Margem de Lucro</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">(Lucro / Valor de Vendas) × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatPercentage(profitMargin)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Taxa de Conversão de Vendas */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-500" />
                    <h3 className="text-sm font-medium">Taxa de Conversão</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">(Vendas / Clientes) × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatPercentage(salesConversionRate)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Valor Médio de Compra */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-orange-500" />
                    <h3 className="text-sm font-medium">Valor Médio de Compra</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Valor de Compras / Número de Compras</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatCurrency(averagePurchaseValue)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Valor Médio de Venda */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    <h3 className="text-sm font-medium">Valor Médio de Venda</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Valor de Vendas / Número de Vendas</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatCurrency(averageSaleValue)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Lucro Total */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-green-500" />
                    <h3 className="text-sm font-medium">Lucro Total</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Valor de Vendas - Valor de Compras</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Lucro Médio por Venda */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="text-sm font-medium">Lucro Médio por Venda</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Lucro / Número de Vendas</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatCurrency(averageProfitPerSale)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Lucro por Cliente */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <TooltipProvider>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-500" />
                    <h3 className="text-sm font-medium">Lucro por Cliente</h3>
                  </div>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Calculator className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Lucro / Número de Clientes</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{formatCurrency(profitPerClient)}</p>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationsSummary;
