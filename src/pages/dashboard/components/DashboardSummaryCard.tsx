import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardCardData } from '@/types/dashboard';

interface DashboardSummaryCardProps {
  cardData: DashboardCardData;
}

const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({ cardData }) => {
  const navigate = useNavigate();
  const { title, value, icon, navigateTo, iconColor, iconBackground, previousValue, isPercentage, isCurrency } = cardData;

  const handleNavigate = () => {
    navigate(navigateTo);
  };

  const formatValue = () => {
    if (isPercentage) return `${value.toFixed(2)}%`;
    if (isCurrency) return `${value.toFixed(2)} €`;
    return value.toLocaleString();
  };

  const getVariationIndicator = () => {
    if (previousValue === undefined || previousValue === 0) return null;

    const diff = value - previousValue;
    const percentChange = (diff / previousValue) * 100;
    const isPositive = percentChange >= 0;

    return (
      <div className={`flex items-center text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
        {percentChange.toFixed(1)}%
      </div>
    );
  };

  return (
    <Card className="stat-card overflow-hidden transition-all duration-300 hover:shadow-md relative group">
      <CardContent className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg ${iconBackground} p-3 mb-3`}>
            <div className={`h-6 w-6 ${iconColor}`}>
              {icon}
            </div>
          </div>

          {/* Quick action button */}
          <button
            onClick={handleNavigate}
            className="text-gray-400 hover:text-gestorApp-blue p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            title={`Ir para ${title}`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gestorApp-gray">{title}</p>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-gestorApp-gray-dark">{formatValue()}</p>
            {getVariationIndicator()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSummaryCard;
