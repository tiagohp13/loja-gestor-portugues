import React from "react";
import { Package, Users, Truck, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { Product, Client, Supplier } from "@/types/";
import DashboardSummaryCard from "./DashboardSummaryCard";
import { DashboardCardData } from "@/types/dashboard";

interface DashboardSummaryCardsProps {
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  totalStockValue: number;

  // Novos props para variação
  totalSales: number;
  totalSalesLast30Days: number;
  totalSalesPreviousMonth: number;

  totalSpent: number;
  totalSpentLast30Days: number;
  totalSpentPreviousMonth: number;

  profit: number;
  profitLast30Days: number;
  profitPreviousMonth: number;

  profitMargin: number;
  profitMarginLast30Days: number;
  profitMarginPreviousMonth: number;
}

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  products,
  clients,
  suppliers,
  totalStockValue,

  totalSales,
  totalSalesLast30Days,
  totalSalesPreviousMonth,

  totalSpent,
  totalSpentLast30Days,
  totalSpentPreviousMonth,

  profit,
  profitLast30Days,
  profitPreviousMonth,

  profitMargin,
  profitMarginLast30Days,
  profitMarginPreviousMonth,
}) => {
  // Função para calcular a variação percentual
  const calcPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const cards: DashboardCardData[] = [
    {
      title: "Total Vendas",
      value: formatCurrency(totalSales),
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: "/vendas",
      iconColor: "text-purple-500",
      iconBackground: "bg-purple-100",
      percentageChange: {
        last30Days: calcPercentageChange(totalSales, totalSalesLast30Days),
        previousMonth: calcPercentageChange(totalSales, totalSalesPreviousMonth),
      },
    },
    {
      title: "Total Gasto",
      value: formatCurrency(totalSpent),
      icon: <Package className="h-6 w-6" />,
      navigateTo: "/despesas",
      iconColor: "text-blue-500",
      iconBackground: "bg-blue-100",
      percentageChange: {
        last30Days: calcPercentageChange(totalSpent, totalSpentLast30Days),
        previousMonth: calcPercentageChange(totalSpent, totalSpentPreviousMonth),
      },
    },
    {
      title: "Lucro",
      value: formatCurrency(profit),
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: "/vendas",
      iconColor: "text-green-500",
      iconBackground: "bg-green-100",
      percentageChange: {
        last30Days: calcPercentageChange(profit, profitLast30Days),
        previousMonth: calcPercentageChange(profit, profitPreviousMonth),
      },
    },
    {
      title: "Margem de Lucro",
      value: `${profitMargin.toFixed(2)}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: "/vendas",
      iconColor: "text-orange-500",
      iconBackground: "bg-orange-100",
      percentageChange: {
        last30Days: calcPercentageChange(profitMargin, profitMarginLast30Days),
        previousMonth: calcPercentageChange(profitMargin, profitMarginPreviousMonth),
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <DashboardSummaryCard key={index} cardData={card} />
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
