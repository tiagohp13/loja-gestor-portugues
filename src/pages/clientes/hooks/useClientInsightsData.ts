import { useMemo } from 'react';
import { Client, StockExit } from '@/types';
import { startOfMonth, endOfMonth, subDays, differenceInDays } from 'date-fns';

interface InactiveClient {
  id: string;
  name: string;
  lastPurchaseDate: string;
  totalSpent: number;
  daysSinceLastPurchase: number;
}

interface NewClient {
  id: string;
  name: string;
  firstPurchaseDate: string;
  totalSpent: number;
}

interface TopClient {
  id: string;
  name: string;
  totalSpent: number;
  percentage: number;
}

interface ClientInsightsData {
  inactiveClients: InactiveClient[];
  newClients: NewClient[];
  topClients: TopClient[];
  currentMonthTotal: number;
  previousMonthAvg: number;
  currentMonthAvg: number;
  avgSpentChange: number;
}

export const useClientInsightsData = (
  clients: Client[],
  stockExits: StockExit[]
): ClientInsightsData => {
  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const ninetyDaysAgo = subDays(now, 90);
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subDays(currentMonthStart, 1));
    const previousMonthEnd = endOfMonth(subDays(currentMonthStart, 1));

    // Process client data
    const clientData = clients.map(client => {
      const clientExits = stockExits.filter(exit => exit.clientId === client.id);
      
      const totalSpent = clientExits.reduce((sum, exit) => {
        const exitTotal = exit.items.reduce((itemSum, item) => {
          const discount = item.discountPercent || 0;
          return itemSum + (item.quantity * item.salePrice * (1 - discount / 100));
        }, 0);
        const exitDiscount = exit.discount || 0;
        return sum + (exitTotal * (1 - exitDiscount / 100));
      }, 0);

      const spentCurrentMonth = clientExits
        .filter(exit => {
          const exitDate = new Date(exit.date);
          return exitDate >= currentMonthStart && exitDate <= currentMonthEnd;
        })
        .reduce((sum, exit) => {
          const exitTotal = exit.items.reduce((itemSum, item) => {
            const discount = item.discountPercent || 0;
            return itemSum + (item.quantity * item.salePrice * (1 - discount / 100));
          }, 0);
          const exitDiscount = exit.discount || 0;
          return sum + (exitTotal * (1 - exitDiscount / 100));
        }, 0);

      const spentPreviousMonth = clientExits
        .filter(exit => {
          const exitDate = new Date(exit.date);
          return exitDate >= previousMonthStart && exitDate <= previousMonthEnd;
        })
        .reduce((sum, exit) => {
          const exitTotal = exit.items.reduce((itemSum, item) => {
            const discount = item.discountPercent || 0;
            return itemSum + (item.quantity * item.salePrice * (1 - discount / 100));
          }, 0);
          const exitDiscount = exit.discount || 0;
          return sum + (exitTotal * (1 - exitDiscount / 100));
        }, 0);

      const purchaseDates = clientExits.map(exit => new Date(exit.date)).sort((a, b) => a.getTime() - b.getTime());
      const firstPurchaseDate = purchaseDates.length > 0 ? purchaseDates[0] : null;
      const lastPurchaseDate = purchaseDates.length > 0 ? purchaseDates[purchaseDates.length - 1] : null;

      return {
        ...client,
        totalSpent,
        spentCurrentMonth,
        spentPreviousMonth,
        firstPurchaseDate,
        lastPurchaseDate,
      };
    });

    // Inactive clients (no purchase in last 90 days)
    const inactiveClients: InactiveClient[] = clientData
      .filter(client => {
        if (!client.lastPurchaseDate) return false;
        return client.lastPurchaseDate < ninetyDaysAgo;
      })
      .map(client => ({
        id: client.id,
        name: client.name,
        lastPurchaseDate: client.lastPurchaseDate!.toISOString(),
        totalSpent: client.totalSpent,
        daysSinceLastPurchase: differenceInDays(now, client.lastPurchaseDate!),
      }))
      .sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase);

    // New clients (first purchase in last 30 days)
    const newClients: NewClient[] = clientData
      .filter(client => {
        if (!client.firstPurchaseDate) return false;
        return client.firstPurchaseDate >= thirtyDaysAgo;
      })
      .map(client => ({
        id: client.id,
        name: client.name,
        firstPurchaseDate: client.firstPurchaseDate!.toISOString(),
        totalSpent: client.totalSpent,
      }))
      .sort((a, b) => new Date(b.firstPurchaseDate).getTime() - new Date(a.firstPurchaseDate).getTime());

    // Top 5 clients by current month spending
    const currentMonthTotal = clientData.reduce((sum, client) => sum + client.spentCurrentMonth, 0);
    
    const topClients: TopClient[] = clientData
      .filter(client => client.spentCurrentMonth > 0)
      .sort((a, b) => b.spentCurrentMonth - a.spentCurrentMonth)
      .slice(0, 5)
      .map(client => ({
        id: client.id,
        name: client.name,
        totalSpent: client.spentCurrentMonth,
        percentage: currentMonthTotal > 0 ? (client.spentCurrentMonth / currentMonthTotal) * 100 : 0,
      }));

    // Average spent calculations
    const activeClientsCurrentMonth = clientData.filter(c => c.spentCurrentMonth > 0).length;
    const activeClientsPreviousMonth = clientData.filter(c => c.spentPreviousMonth > 0).length;
    
    const currentMonthAvg = activeClientsCurrentMonth > 0 ? currentMonthTotal / activeClientsCurrentMonth : 0;
    const previousMonthTotal = clientData.reduce((sum, client) => sum + client.spentPreviousMonth, 0);
    const previousMonthAvg = activeClientsPreviousMonth > 0 ? previousMonthTotal / activeClientsPreviousMonth : 0;
    
    const avgSpentChange = previousMonthAvg > 0 
      ? ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100 
      : 0;

    return {
      inactiveClients,
      newClients,
      topClients,
      currentMonthTotal,
      previousMonthAvg,
      currentMonthAvg,
      avgSpentChange,
    };
  }, [clients, stockExits]);
};
