import React, { useMemo } from "react";
import { Package, Users, Truck, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { Product, Client, Supplier } from "@/types/";
import DashboardSummaryCard from "./DashboardSummaryCard";
import { DashboardCardData } from "@/types/dashboard";
import { subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface DashboardSummaryCardsProps {
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  totalStockValue: number;
  totalSalesValue: number;
  totalPurchaseValue: number;
  totalProfit: number;
  // Arrays de vendas e compras com datas
  stockExits: { date: string; value: number }[];
  stockEntries: { date: string; value: number }[];
}

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  products,
  clients,
  suppliers,
  totalStockValue,
  totalSalesValue,
  totalPurchaseValue,
  totalProfit,
  stockExits,
  stockEntries,
}) => {
  const calculatePercentageChange = (currentPeriod: number, previousPeriod: number) => {
    if (previousPeriod === 0) return undefined;
    return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  };

  const now = new Date();
  const last30DaysInterval = { start: subDays(now, 30), end: now };
  const previous30DaysInterval = { start: subDays(now, 60), end: subDays(now, 31) };

  const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const previousMonthInterval = {
    start: startOfMonth(subDays(startOfMonth(now), 1)),
    end: endOfMonth(subDays(startOfMonth(now), 1)),
  };

  const sumInInterval = (items: { date: string; value: number }[], interval: { start: Date; end: Date }) =>
    items.filter((i) => isWithinInterval(new Date(i.date), interval)).reduce((sum, i) => sum + i.value, 0);

  const salesLast30 = sumInInterval(stockExits, last30DaysInterval);
  const salesPrev30 = sumInInterval(stockExits, previous30DaysInterval);
  const salesPrevMonth = sumInInterval(stockExits, previousMonthInterval);
  const salesCurrMonth = sumInInterval(stockExits, currentMonthInterval);

  const purchasesLast30 = sumInInterval(stockEntries, last30DaysInterval);
  const purchasesPrev30 = sumInInterval(stockEntries, previous30DaysInterval);
  const purchasesPrevMonth = sumInInterval(stockEntries, previousMonthInterval);
  const purchasesCurrMonth = sumInInterval(stockEntries, currentMonthInterval);

  const cards: DashboardCardData[] = [
    {
      title: "Total Produtos",
      value: products.length,
      icon: <Package className="h-6 w-6" />,
      navigateTo: "/produtos/consultar",
      iconColor: "text-blue-500",
      iconBackground: "bg-blue-100",
    },
    {
      title: "Total Clientes",
      value: clients.length,
      icon: <Users className="h-6 w-6" />,
      navigateTo: "/clientes/consultar",
      iconColor: "text-green-500",
      iconBackground: "bg-green-100",
    },
    {
      title: "Total Fornecedores",
      value: suppliers.length,
      icon: <Truck className="h-6 w-6" />,
      navigateTo: "/fornecedores/consultar",
      iconColor: "text-orange-500",
      iconBackground: "bg-orange-100",
    },
    {
      title: "Total Vendas",
      value: formatCurrency(totalSalesValue),
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: "/vendas",
      iconColor: "text-purple-500",
      iconBackground: "bg-purple-100",
      percentageChange: {
        last30Days: calculatePercentageChange(salesLast30, salesPrev30),
        previousMonth: calculatePercentageChange(salesCurrMonth, salesPrevMonth),
      },
    },
    {
      title: "Total Compras",
      value: formatCurrency(totalPurchaseValue),
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: "/compras",
      iconColor: "text-red-500",
      iconBackground: "bg-red-100",
      percentageChange: {
        last30Days: calculatePercentageChange(purchasesLast30, purchasesPrev30),
        previousMonth: calculatePercentageChange(purchasesCurrMonth, purchasesPrevMonth),
      },
    },
    {
      title: "Lucro",
      value: formatCurrency(totalProfit),
      icon: <TrendingUp className="h-6 w-6" />,
      navigateTo: "/dashboard",
      iconColor: "text-green-700",
      iconBackground: "bg-green-100",
      percentageChange: {
        last30Days: calculatePercentageChange(salesLast30 - purchasesLast30, salesPrev30 - purchasesPrev30),
        previousMonth: calculatePercentageChange(
          salesCurrMonth - purchasesCurrMonth,
          salesPrevMonth - purchasesPrevMonth,
        ),
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
