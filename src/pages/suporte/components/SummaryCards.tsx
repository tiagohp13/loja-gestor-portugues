import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { SupportStats } from '../types/supportTypes';
import SummaryCardSkeleton from '@/components/ui/SummaryCardSkeleton';

interface KpiDelta {
  pct30d: number;
  pctMoM: number;
}

interface KpiDeltas {
  sales: KpiDelta;
  spent: KpiDelta;
  profit: KpiDelta;
  margin: KpiDelta;
}

interface SummaryCardsProps {
  stats: SupportStats;
  isLoading?: boolean;
  deltas?: KpiDeltas;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, isLoading = false, deltas }) => {
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
                {deltas?.sales && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.sales.pct30d >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      30d: {deltas.sales.pct30d >= 0 ? '+' : ''}{deltas.sales.pct30d.toFixed(1)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.sales.pctMoM >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      M/M: {deltas.sales.pctMoM >= 0 ? '+' : ''}{deltas.sales.pctMoM.toFixed(1)}%
                    </span>
                  </div>
                )}
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
                {deltas?.spent && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.spent.pct30d >= 0 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      30d: {deltas.spent.pct30d >= 0 ? '+' : ''}{deltas.spent.pct30d.toFixed(1)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.spent.pctMoM >= 0 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      M/M: {deltas.spent.pctMoM >= 0 ? '+' : ''}{deltas.spent.pctMoM.toFixed(1)}%
                    </span>
                  </div>
                )}
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
                {deltas?.profit && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.profit.pct30d >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      30d: {deltas.profit.pct30d >= 0 ? '+' : ''}{deltas.profit.pct30d.toFixed(1)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.profit.pctMoM >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      M/M: {deltas.profit.pctMoM >= 0 ? '+' : ''}{deltas.profit.pctMoM.toFixed(1)}%
                    </span>
                  </div>
                )}
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
                {deltas?.margin && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.margin.pct30d >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      30d: {deltas.margin.pct30d >= 0 ? '+' : ''}{deltas.margin.pct30d.toFixed(1)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      deltas.margin.pctMoM >= 0 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      M/M: {deltas.margin.pctMoM >= 0 ? '+' : ''}{deltas.margin.pctMoM.toFixed(1)}%
                    </span>
                  </div>
                )}
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
