import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';
import SummaryCardSkeleton from '@/components/ui/SummaryCardSkeleton';

interface SummaryCardsProps {
  stats: SupportStats;
  isLoading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, isLoading = false }) => {
  // Default card configuration
  const defaultCardConfig = [
    { id: 'totalSales', title: 'Total de Vendas', enabled: true, order: 0 },
    { id: 'totalSpent', title: 'Total Gasto', enabled: true, order: 1 },
    { id: 'profit', title: 'Lucro', enabled: true, order: 2 },
    { id: 'profitMargin', title: 'Margem de Lucro', enabled: true, order: 3 }
  ];

  const [cardConfig, setCardConfig] = useState(() => {
    const saved = localStorage.getItem('dashboard-card-config');
    return saved ? JSON.parse(saved) : defaultCardConfig;
  });

  const [cardColors, setCardColors] = useState(() => {
    const saved = localStorage.getItem('dashboard-card-colors');
    return saved ? JSON.parse(saved) : {};
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <SummaryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleStorageChange = () => {
        const savedConfig = localStorage.getItem('dashboard-card-config');
        if (savedConfig) {
            setCardConfig(JSON.parse(savedConfig));
        }
        const savedColors = localStorage.getItem('dashboard-card-colors');
        if (savedColors) {
            setCardColors(JSON.parse(savedColors));
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper function to render variation indicator (month to month)
  const renderVariation = (currentValue: number, previousValue: number) => {
    if (previousValue === 0 || !previousValue) return null;
    
    const diff = currentValue - previousValue;
    const percentChange = (diff / previousValue) * 100;
    const isPositive = percentChange >= 0;
    
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-1`}>
        {isPositive ? (
          <ArrowUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        )}
        <span>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
      </div>
    );
  };

  const getCardContent = (cardId: string) => {
    const cardColor = cardColors[cardId] || '';
    
    switch (cardId) {
      case 'totalSales':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 transition-colors duration-200" />
                  <div className="text-2xl font-bold text-foreground transition-all duration-500 ease-out">
                    {formatCurrency(stats.totalSales)}
                  </div>
                </div>
                {stats.monthlySales && stats.monthlySales.length >= 6 && 
                  renderVariation(
                    stats.monthlySales[stats.monthlySales.length - 1] || 0,
                    stats.monthlySales[stats.monthlySales.length - 2] || 0
                  )
                }
              </div>
            </CardContent>
          </Card>
        );

      case 'totalSpent':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-red-600 dark:text-red-400 transition-colors duration-200" />
                  <div className="text-2xl font-bold text-foreground transition-all duration-500 ease-out">
                    {formatCurrency(stats.totalSpent)}
                  </div>
                </div>
                {stats.monthlyData && stats.monthlyData.length >= 6 && 
                  renderVariation(
                    stats.monthlyData[stats.monthlyData.length - 1]?.compras || 0,
                    stats.monthlyData[stats.monthlyData.length - 2]?.compras || 0
                  )
                }
              </div>
            </CardContent>
          </Card>
        );

      case 'profit':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  {stats.profit >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 transition-colors duration-200" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-2 text-red-600 dark:text-red-400 transition-colors duration-200" />
                  )}
                  <div className="text-2xl font-bold text-foreground transition-all duration-500 ease-out">
                    {formatCurrency(stats.profit)}
                  </div>
                </div>
                {stats.monthlyData && stats.monthlyData.length >= 6 && 
                  renderVariation(
                    (stats.monthlyData[stats.monthlyData.length - 1]?.vendas || 0) - (stats.monthlyData[stats.monthlyData.length - 1]?.compras || 0),
                    (stats.monthlyData[stats.monthlyData.length - 2]?.vendas || 0) - (stats.monthlyData[stats.monthlyData.length - 2]?.compras || 0)
                  )
                }
              </div>
            </CardContent>
          </Card>
        );

      case 'profitMargin':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-all duration-300 animate-fade-in ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Percent className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 transition-colors duration-200" />
                  <div className="text-2xl font-bold text-foreground transition-all duration-500 ease-out">
                    {formatPercentage(stats.profitMargin)}
                  </div>
                </div>
                {stats.monthlyData && stats.monthlyData.length >= 6 && (() => {
                  const currentSales = stats.monthlyData[stats.monthlyData.length - 1]?.vendas || 0;
                  const currentSpent = stats.monthlyData[stats.monthlyData.length - 1]?.compras || 0;
                  const previousSales = stats.monthlyData[stats.monthlyData.length - 2]?.vendas || 0;
                  const previousSpent = stats.monthlyData[stats.monthlyData.length - 2]?.compras || 0;
                  
                  const currentMargin = currentSales > 0 ? ((currentSales - currentSpent) / currentSales) * 100 : 0;
                  const previousMargin = previousSales > 0 ? ((previousSales - previousSpent) / previousSales) * 100 : 0;
                  
                  return renderVariation(currentMargin, previousMargin);
                })()}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const enabledCards = cardConfig
    .filter(card => card.enabled)
    .sort((a, b) => a.order - b.order);
  
  if (enabledCards.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {enabledCards.map((card) => (
          <div key={card.id}>
            {getCardContent(card.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
