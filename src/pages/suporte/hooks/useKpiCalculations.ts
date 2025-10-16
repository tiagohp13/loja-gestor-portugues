
import { useMemo } from 'react';
import { SupportStats } from '../types/supportTypes';

/**
 * Custom hook for calculating KPIs based on business data including expenses
 */
export const useKpiCalculations = (stats: SupportStats) => {
  return useMemo(() => {
    // Calculate basic metrics that will be used in multiple KPI calculations
    const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
    const salesCount = stats.completedOrders; // Número real de vendas (saídas ativas)
    
    // ROI (Retorno sobre o Investimento) = (Lucro / Total Gasto incluindo despesas) × 100
    const roi = stats.totalSpent > 0 ? Number(((stats.profit / stats.totalSpent) * 100).toFixed(2)) : 0;
    
    // Margem de Lucro = (Lucro / Valor de Vendas) × 100 (já inclui despesas no cálculo do lucro)
    const profitMargin = Number(stats.profitMargin.toFixed(2));
    
    // Taxa de Conversão de Vendas = (Número de Vendas / Número de Clientes) × 100
    const salesConversionRate = stats.clientsCount > 0 ? Number(((salesCount / stats.clientsCount) * 100).toFixed(2)) : 0;
    
    // Valor Médio de Compra = (Total Gasto) / (Número de Compras + Número de Despesas)
    const totalTransactions = totalEntries + (stats.numberOfExpenses || 0);
    const averagePurchaseValue = totalTransactions > 0 ? Number((stats.totalSpent / totalTransactions).toFixed(2)) : 0;
    
    // Valor Médio de Venda = Valor de Vendas / Número de Vendas
    const averageSaleValue = salesCount > 0 ? Number((stats.totalSales / salesCount).toFixed(2)) : 0;
    
    // Lucro Total = Valor de Vendas - (Compras + Despesas)
    const totalProfit = Number(stats.profit.toFixed(2));
    
    // Lucro Médio por Venda = Lucro / Número de Vendas
    const averageProfitPerSale = salesCount > 0 ? Number((stats.profit / salesCount).toFixed(2)) : 0;
    
    // Lucro por Cliente = Lucro / Número de Clientes
    const profitPerClient = stats.clientsCount > 0 ? Number((stats.profit / stats.clientsCount).toFixed(2)) : 0;

    return {
      // Return all calculated KPIs
      roi,
      profitMargin,
      salesConversionRate,
      averagePurchaseValue,
      averageSaleValue,
      totalProfit,
      averageProfitPerSale,
      profitPerClient,
      // Additional metrics that might be useful
      salesCount,
      totalEntries,
      totalTransactions
    };
  }, [stats]);
};
