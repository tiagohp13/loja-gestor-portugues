import { useMemo } from 'react';
import { Client } from '@/types';
import { subDays } from 'date-fns';

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

export const useClientKpis = (clients: Client[], _unused: any[]): ClientKpis => {
  return useMemo(() => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const last90Days = subDays(now, 90);

    // Clientes com compras nos últimos 30 dias
    const activeClients30d = clients.filter(client => {
      if (!client.lastPurchaseDate) return false;
      return new Date(client.lastPurchaseDate) >= last30Days;
    }).length;

    // Novos clientes (criados nos últimos 30 dias)
    const newClients30d = clients.filter(client => {
      return new Date(client.createdAt) >= last30Days;
    }).length;

    // Total gasto por todos os clientes (usando campo do banco)
    const totalSpent = clients.reduce((sum, client) => sum + (client.totalSpent || 0), 0);

    // Clientes com pelo menos uma compra
    const totalClientsWithPurchases = clients.filter(client => (client.purchaseCount || 0) > 0).length;

    // Média por cliente ativo
    const avgSpentPerActiveClient = totalClientsWithPurchases > 0 
      ? totalSpent / totalClientsWithPurchases 
      : 0;

    // Top 5 clientes por valor gasto
    const sortedBySpent = [...clients].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    const top5Total = sortedBySpent.slice(0, 5).reduce((sum, client) => sum + (client.totalSpent || 0), 0);
    const top5Percentage = totalSpent > 0 ? (top5Total / totalSpent) * 100 : 0;

    // Clientes inativos há mais de 90 dias
    const inactiveClients90d = clients.filter(client => {
      if (!client.lastPurchaseDate) return true; // Nunca compraram
      return new Date(client.lastPurchaseDate) < last90Days;
    }).length;

    return {
      activeClients30d,
      newClients30d,
      totalSpentCurrentMonth: totalSpent, // Aproximação: total gasto geral
      avgSpentPerActiveClient,
      top5Percentage,
      inactiveClients90d,
      totalClientsWithPurchases,
      avgSpentPreviousMonth: 0, // Não temos dados históricos mensais
      avgSpentChange: 0, // Não temos dados históricos mensais
    };
  }, [clients]);
};
