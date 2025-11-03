import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCardData } from "@/types/dashboard";

interface DashboardSummaryCardProps {
  cardData: DashboardCardData;
}

const DashboardSummaryCard = React.memo<DashboardSummaryCardProps>(({ cardData }) => {
  const navigate = useNavigate();
  const { title, value, icon, navigateTo, iconColor, iconBackground } = cardData;

  const handleNavigate = () => navigate(navigateTo);

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 group">
      <CardContent className="px-6 py-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg ${iconBackground} bg-opacity-20 p-3`}>
            <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
          </div>

          {/* botão de ação */}
          <button
            onClick={handleNavigate}
            className="text-gray-400 hover:text-primary p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            title={`Ir para ${title}`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
});

DashboardSummaryCard.displayName = 'DashboardSummaryCard';

export default DashboardSummaryCard;
