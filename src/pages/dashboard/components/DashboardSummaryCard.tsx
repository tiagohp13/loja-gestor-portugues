import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCardData } from "@/types/dashboard";

interface DashboardSummaryCardProps {
  cardData: DashboardCardData;
}

const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({ cardData }) => {
  const navigate = useNavigate();
  const { title, value, icon, navigateTo, iconColor, iconBackground, percentageChange } = cardData;

  const handleNavigate = () => navigate(navigateTo);

  const renderPercentage = (percent?: number) => {
    if (percent === undefined) return null;
    const isPositive = percent >= 0;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";
    const Icon = isPositive ? ArrowUp : ArrowDown;
    return (
      <div className={`flex items-center gap-1 text-sm font-semibold ${colorClass}`}>
        <Icon className="h-4 w-4" />
        {Math.abs(percent).toFixed(1)}%
      </div>
    );
  };

  return (
    <Card className="stat-card overflow-hidden transition-all duration-300 hover:shadow-md relative group">
      <CardContent className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg ${iconBackground} p-3 mb-3`}>
            <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
          </div>
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
          <p className="text-2xl font-bold text-gestorApp-gray-dark">{value}</p>
          {percentageChange && (
            <div className="flex flex-col gap-1">
              <div>Últimos 30 dias: {renderPercentage(percentageChange.last30Days)}</div>
              <div>Mês anterior: {renderPercentage(percentageChange.previousMonth)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSummaryCard;
