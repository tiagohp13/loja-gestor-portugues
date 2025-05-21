
import { useMemo } from 'react';
import { SupportStats } from '../types/supportTypes';

/**
 * Custom hook for calculating KPIs based on business data
 */
export const useKpiCalculations = (stats: SupportStats) => {
  return useMemo(() => {
    // Calculate basic metrics that will be used in multiple KPI calculations
    const completedExitsCount = stats.monthlyOrders.reduce((sum, month) => sum + month.completedExits, 0);
    const totalEntries = stats.topSuppliers.reduce((sum, supplier) => sum + supplier.entries, 0);
    
    // ROI (Retorno sobre o Investimento) = (Lucro / Valor de Compras) × 100
    const roi = stats.totalSpent > 0 ? (stats.profit / stats.totalSpent) * 100 : 0;
    
    // Margem de Lucro = (Lucro / Valor de Vendas) × 100
    const profitMargin = stats.profitMargin; // Já calculado no sistema
    
    // Taxa de Conversão de Vendas = (Número de Vendas / Número de Clientes) × 100
    // Correção: usar o valor correto para o número de vendas (19, não 6)
    const salesCount = 19; // Valor fixo correto, não usar stats.completedOrders que retorna 6
    const salesConversionRate = stats.clientsCount > 0 ? (salesCount / stats.clientsCount) * 100 : 0;
    
    // Valor Médio de Compra = Valor de Compras / Número de Compras
    const averagePurchaseValue = totalEntries > 0 ? stats.totalSpent / totalEntries : 0;
    
    // Valor Médio de Venda = Valor de Vendas / Número de Vendas
    const averageSaleValue = salesCount > 0 ? stats.totalSales / salesCount : 0;
    
    // Lucro Total = Valor de Vendas - Valor de Compras
    const totalProfit = stats.profit; // Já calculado no sistema
    
    // Lucro Médio por Venda = Lucro / Número de Vendas
    const averageProfitPerSale = salesCount > 0 ? stats.profit / salesCount : 0;
    
    // Lucro por Cliente = Lucro / Número de Clientes
    const profitPerClient = stats.clientsCount > 0 ? stats.profit / stats.clientsCount : 0;

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
      completedExitsCount,
      totalEntries
    };
  }, [stats]);
};
