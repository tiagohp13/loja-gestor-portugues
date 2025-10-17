import { useMemo } from 'react';
import { Client, StockExit } from '@/types';
import { startOfMonth, endOfMonth, subDays, isWithinInterval, subMonths } from 'date-fns';

interface ClientKpis {
  activeClients30d: number;
  newClients30d: number;
  totalSpentCurrentMonth: number;
  avgSpentPerActiveClient: number;
  top5Percentage: number;
  inactiveClients90d: number;
  totalClientsWithPurchases: number;
  avgSpentPreviousMonth: number;
  avgSpentChange: number;
}

export const useClientKpis = (clients: Client[], stockExits: StockExit[]): ClientKpis => {
  return useMemo(() => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const last90Days = subDays(now, 90);
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    // Calcular compras de cada cliente com datas
    const clientPurchases = clients.map(client => {
      const clientExits = stockExits.filter(exit => exit.clientId === client.id);
      
      const totalSpent = clientExits.reduce((sum, exit) => {
        const exitTotal = exit.items.reduce((itemSum, item) => {
          const itemTotal = item.salePrice * item.quantity;
          const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
          return itemSum + (itemTotal - discountAmount);
        }, 0);
        const orderDiscount = exit.discount || 0;
        return sum + exitTotal * (1 - orderDiscount / 100);
      }, 0);

      const purchaseDates = clientExits.map(exit => new Date(exit.date)).sort((a, b) => a.getTime() - b.getTime());
      const firstPurchaseDate = purchaseDates.length > 0 ? purchaseDates[0] : null;
      const lastPurchaseDate = purchaseDates.length > 0 ? purchaseDates[purchaseDates.length - 1] : null;

      // Compras no mês atual
      const currentMonthExits = clientExits.filter(exit => 
        isWithinInterval(new Date(exit.date), { start: currentMonthStart, end: currentMonthEnd })
      );
      const spentCurrentMonth = currentMonthExits.reduce((sum, exit) => {
        const exitTotal = exit.items.reduce((itemSum, item) => {
          const itemTotal = item.salePrice * item.quantity;
          const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
          return itemSum + (itemTotal - discountAmount);
        }, 0);
        const orderDiscount = exit.discount || 0;
        return sum + exitTotal * (1 - orderDiscount / 100);
      }, 0);

      // Compras no mês anterior
      const previousMonthExits = clientExits.filter(exit => 
        isWithinInterval(new Date(exit.date), { start: previousMonthStart, end: previousMonthEnd })
      );
      const spentPreviousMonth = previousMonthExits.reduce((sum, exit) => {
        const exitTotal = exit.items.reduce((itemSum, item) => {
          const itemTotal = item.salePrice * item.quantity;
          const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
          return itemSum + (itemTotal - discountAmount);
        }, 0);
        const orderDiscount = exit.discount || 0;
        return sum + exitTotal * (1 - orderDiscount / 100);
      }, 0);

      return {
        client,
        totalSpent,
        firstPurchaseDate,
        lastPurchaseDate,
        spentCurrentMonth,
        spentPreviousMonth,
        hasRecentPurchase: lastPurchaseDate ? lastPurchaseDate >= last30Days : false,
        isNewClient: firstPurchaseDate ? firstPurchaseDate >= last30Days : false,
      };
    });

    // KPI 1: Clientes Ativos (30 dias)
    const activeClients30d = clientPurchases.filter(cp => cp.hasRecentPurchase).length;

    // KPI 2: Novos Clientes (30 dias)
    const newClients30d = clientPurchases.filter(cp => cp.isNewClient).length;

    // KPI 3: Valor Total Gasto (mês atual)
    const totalSpentCurrentMonth = clientPurchases.reduce((sum, cp) => sum + cp.spentCurrentMonth, 0);

    // KPI 4: Valor Médio por Cliente Ativo (mês atual)
    const activeClientsCurrentMonth = clientPurchases.filter(cp => cp.spentCurrentMonth > 0).length;
    const avgSpentPerActiveClient = activeClientsCurrentMonth > 0 
      ? totalSpentCurrentMonth / activeClientsCurrentMonth 
      : 0;

    // KPI 5: % dos 5 Melhores Clientes
    const top5Clients = [...clientPurchases]
      .sort((a, b) => b.spentCurrentMonth - a.spentCurrentMonth)
      .slice(0, 5);
    const top5Total = top5Clients.reduce((sum, cp) => sum + cp.spentCurrentMonth, 0);
    const top5Percentage = totalSpentCurrentMonth > 0 
      ? (top5Total / totalSpentCurrentMonth) * 100 
      : 0;

    // Insights: Clientes inativos há mais de 90 dias
    const inactiveClients90d = clientPurchases.filter(cp => {
      if (!cp.lastPurchaseDate) return true;
      return cp.lastPurchaseDate < last90Days;
    }).length;

    // Total de clientes com pelo menos uma compra
    const totalClientsWithPurchases = clientPurchases.filter(cp => cp.totalSpent > 0).length;

    // Média de gasto no mês anterior
    const totalSpentPreviousMonth = clientPurchases.reduce((sum, cp) => sum + cp.spentPreviousMonth, 0);
    const activeClientsPreviousMonth = clientPurchases.filter(cp => cp.spentPreviousMonth > 0).length;
    const avgSpentPreviousMonth = activeClientsPreviousMonth > 0 
      ? totalSpentPreviousMonth / activeClientsPreviousMonth 
      : 0;

    // Mudança percentual na média de gasto
    const avgSpentChange = avgSpentPreviousMonth > 0 
      ? ((avgSpentPerActiveClient - avgSpentPreviousMonth) / avgSpentPreviousMonth) * 100 
      : 0;

    return {
      activeClients30d,
      newClients30d,
      totalSpentCurrentMonth,
      avgSpentPerActiveClient,
      top5Percentage,
      inactiveClients90d,
      totalClientsWithPurchases,
      avgSpentPreviousMonth,
      avgSpentChange,
    };
  }, [clients, stockExits]);
};
