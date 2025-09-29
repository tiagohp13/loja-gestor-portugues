import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';

interface SummaryCardsProps {
  stats: SupportStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
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

  // Helper function to render variation indicator for last 6 months
  const renderVariation = (monthlyData: any[], currentValue: number) => {
    if (!monthlyData || monthlyData.length < 12) return null;
    
    // Get last 6 months and previous 6 months
    const last6Months = monthlyData.slice(-6);
    const previous6Months = monthlyData.slice(-12, -6);
    
    const getLast6MonthsValue = (fieldName: string) => {
      return last6Months.reduce((sum, month) => sum + (month[fieldName] || 0), 0);
    };
    
    const getPrevious6MonthsValue = (fieldName: string) => {
      return previous6Months.reduce((sum, month) => sum + (month[fieldName] || 0), 0);
    };
    
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0 || !previous) return 0;
      return ((current - previous) / previous) * 100;
    };
    
    return { getLast6MonthsValue, getPrevious6MonthsValue, calculatePercentageChange };
  };

  const renderPercentageIndicator = (percentChange: number) => {
    if (isNaN(percentChange) || !isFinite(percentChange)) return null;
    
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
          <Card className={`border-border bg-card hover:shadow-md transition-shadow duration-200 ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSales)}</div>
                </div>
                {(() => {
                  const helper = renderVariation(stats.monthlyData, stats.totalSales);
                  if (!helper) return null;
                  
                  const last6MonthsSales = helper.getLast6MonthsValue('vendas');
                  const previous6MonthsSales = helper.getPrevious6MonthsValue('vendas');
                  const percentChange = helper.calculatePercentageChange(last6MonthsSales, previous6MonthsSales);
                  
                  return renderPercentageIndicator(percentChange);
                })()}
              </div>
            </CardContent>
          </Card>
        );

      case 'totalSpent':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-shadow duration-200 ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSpent)}</div>
                </div>
                {(() => {
                  const helper = renderVariation(stats.monthlyData, stats.totalSpent);
                  if (!helper) return null;
                  
                  const last6MonthsSpent = helper.getLast6MonthsValue('compras');
                  const previous6MonthsSpent = helper.getPrevious6MonthsValue('compras');
                  const percentChange = helper.calculatePercentageChange(last6MonthsSpent, previous6MonthsSpent);
                  
                  return renderPercentageIndicator(percentChange);
                })()}
              </div>
            </CardContent>
          </Card>
        );

      case 'profit':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-shadow duration-200 ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  {stats.profit >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                  )}
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.profit)}</div>
                </div>
                {(() => {
                  const helper = renderVariation(stats.monthlyData, stats.profit);
                  if (!helper) return null;
                  
                  const last6MonthsSales = helper.getLast6MonthsValue('vendas');
                  const last6MonthsSpent = helper.getLast6MonthsValue('compras');
                  const previous6MonthsSales = helper.getPrevious6MonthsValue('vendas');
                  const previous6MonthsSpent = helper.getPrevious6MonthsValue('compras');
                  
                  const last6MonthsProfit = last6MonthsSales - last6MonthsSpent;
                  const previous6MonthsProfit = previous6MonthsSales - previous6MonthsSpent;
                  const percentChange = helper.calculatePercentageChange(last6MonthsProfit, previous6MonthsProfit);
                  
                  return renderPercentageIndicator(percentChange);
                })()}
              </div>
            </CardContent>
          </Card>
        );

      case 'profitMargin':
        return (
          <Card className={`border-border bg-card hover:shadow-md transition-shadow duration-200 ${cardColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Percent className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                  <div className="text-2xl font-bold text-foreground">{formatPercentage(stats.profitMargin)}</div>
                </div>
                {(() => {
                  const helper = renderVariation(stats.monthlyData, stats.profitMargin);
                  if (!helper) return null;
                  
                  const last6MonthsSales = helper.getLast6MonthsValue('vendas');
                  const last6MonthsSpent = helper.getLast6MonthsValue('compras');
                  const previous6MonthsSales = helper.getPrevious6MonthsValue('vendas');
                  const previous6MonthsSpent = helper.getPrevious6MonthsValue('compras');
                  
                  const last6MonthsMargin = last6MonthsSales > 0 ? ((last6MonthsSales - last6MonthsSpent) / last6MonthsSales) * 100 : 0;
                  const previous6MonthsMargin = previous6MonthsSales > 0 ? ((previous6MonthsSales - previous6MonthsSpent) / previous6MonthsSales) * 100 : 0;
                  const percentChange = helper.calculatePercentageChange(last6MonthsMargin, previous6MonthsMargin);
                  
                  return renderPercentageIndicator(percentChange);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
