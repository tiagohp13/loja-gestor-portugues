
import { useData } from '@/contexts/DataContext';
import { useState, useMemo } from 'react';
import { Product } from '@/types';

export const useDashboardData = () => {
  const { products, suppliers, clients, stockEntries, stockExits } = useData();

  const ensureDate = (dateInput: string | Date): Date => {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  };
  
  // Prepare monthly data for charts
  const monthlyData = useMemo(() => {
    const dataMap = new Map();
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      dataMap.set(monthKey, {
        name: month.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
        vendas: 0,
        compras: 0
      });
    }
    
    stockExits.forEach(exit => {
      const date = ensureDate(exit.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (dataMap.has(monthKey)) {
        const current = dataMap.get(monthKey);
        const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
        
        dataMap.set(monthKey, {
          ...current,
          vendas: current.vendas + exitTotal
        });
      }
    });
    
    stockEntries.forEach(entry => {
      const date = ensureDate(entry.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (dataMap.has(monthKey)) {
        const current = dataMap.get(monthKey);
        const entryTotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
        
        dataMap.set(monthKey, {
          ...current,
          compras: current.compras + entryTotal
        });
      }
    });
    
    return Array.from(dataMap.values());
  }, [stockExits, stockEntries]);
  
  // Prepare category data for charts
  const categoryData = useMemo(() => {
    const categoryCounts = products.reduce((acc, product) => {
      const { category } = product;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category || 'Sem categoria',
      quantidade: count
    }));
  }, [products]);
  
  // Calculate low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(product => 
      product.currentStock <= (product.minStock || 0) && product.minStock > 0
    );
  }, [products]);
  
  // Prepare recent transactions
  const allTransactions = useMemo(() => {
    return [
      ...stockEntries.flatMap(entry => entry.items.map(item => ({
        id: entry.id,
        type: 'entry' as const,
        productId: item.productId,
        product: products.find(p => p.id === item.productId),
        entity: entry.supplierName || suppliers.find(s => s.id === entry.supplierId)?.name || 'Desconhecido',
        entityId: entry.supplierId,
        quantity: item.quantity,
        date: entry.date,
        value: item.quantity * item.purchasePrice
      }))),
      ...stockExits.flatMap(exit => exit.items.map(item => ({
        id: exit.id,
        type: 'exit' as const,
        productId: item.productId,
        product: products.find(p => p.id === item.productId),
        entity: exit.clientName || clients.find(c => c.id === exit.clientId)?.name || 'Desconhecido',
        entityId: exit.clientId,
        quantity: item.quantity,
        date: exit.date,
        value: item.quantity * item.salePrice
      })))
    ];
  }, [stockEntries, stockExits, products, suppliers, clients]);
  
  const recentTransactions = useMemo(() => {
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [allTransactions]);
  
  // Calculate statistics
  const productSales = useMemo(() => {
    return stockExits.flatMap(exit => exit.items).reduce((acc, item) => {
      const { productId, quantity } = item;
      if (!acc[productId]) {
        acc[productId] = 0;
      }
      acc[productId] += quantity;
      return acc;
    }, {} as Record<string, number>);
  }, [stockExits]);
  
  const mostSoldProduct = useMemo(() => {
    let mostSoldProductId = '';
    let mostSoldQuantity = 0;
    
    Object.entries(productSales).forEach(([productId, quantity]) => {
      if (quantity > mostSoldQuantity) {
        mostSoldProductId = productId;
        mostSoldQuantity = quantity;
      }
    });
    
    return products.find(p => p.id === mostSoldProductId);
  }, [productSales, products]);
  
  const mostFrequentClient = useMemo(() => {
    const clientPurchases = stockExits.reduce((acc, exit) => {
      const { clientId } = exit;
      if (!acc[clientId]) {
        acc[clientId] = 0;
      }
      acc[clientId] += 1;
      return acc;
    }, {} as Record<string, number>);
    
    let mostFrequentClientId = '';
    let mostFrequentClientCount = 0;
    
    Object.entries(clientPurchases).forEach(([clientId, count]) => {
      if (count > mostFrequentClientCount) {
        mostFrequentClientId = clientId;
        mostFrequentClientCount = count;
      }
    });
    
    return clients.find(c => c.id === mostFrequentClientId);
  }, [stockExits, clients]);
  
  const mostUsedSupplier = useMemo(() => {
    const supplierPurchases = stockEntries.reduce((acc, entry) => {
      const { supplierId } = entry;
      if (!acc[supplierId]) {
        acc[supplierId] = 0;
      }
      acc[supplierId] += 1;
      return acc;
    }, {} as Record<string, number>);
    
    let mostUsedSupplierId = '';
    let mostUsedSupplierCount = 0;
    
    Object.entries(supplierPurchases).forEach(([supplierId, count]) => {
      if (count > mostUsedSupplierCount) {
        mostUsedSupplierId = supplierId;
        mostUsedSupplierCount = count;
      }
    });
    
    return suppliers.find(s => s.id === mostUsedSupplierId);
  }, [stockEntries, suppliers]);
  
  // Calculate financial metrics
  const totalSalesValue = useMemo(() => {
    return stockExits.reduce((total, exit) => {
      const exitTotal = exit.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      return total + exitTotal;
    }, 0);
  }, [stockExits]);
  
  const totalPurchaseValue = useMemo(() => {
    return stockEntries.reduce((total, entry) => {
      const entryTotal = entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
      return total + entryTotal;
    }, 0);
  }, [stockEntries]);
  
  const totalStockValue = useMemo(() => {
    return products.reduce((total, product) => {
      return total + (product.currentStock * product.purchasePrice);
    }, 0);
  }, [products]);

  const totalProfit = useMemo(() => {
    return totalSalesValue - totalPurchaseValue;
  }, [totalSalesValue, totalPurchaseValue]);
  
  const profitMarginPercent = useMemo(() => {
    return totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;
  }, [totalProfit, totalSalesValue]);
  
  // Calcular o ROI
  const roiValue = useMemo(() => {
    // ROI em euros é o resultado do lucro dividido pelo valor das compras
    return totalPurchaseValue > 0 ? totalProfit / totalPurchaseValue : 0;
  }, [totalProfit, totalPurchaseValue]);
  
  const roiPercent = useMemo(() => {
    // ROI em percentagem é o ROI em euros multiplicado por 100
    return totalPurchaseValue > 0 ? (totalProfit / totalPurchaseValue) * 100 : 0;
  }, [totalProfit, totalPurchaseValue]);

  return {
    products,
    suppliers,
    clients,
    ensureDate,
    monthlyData,
    categoryData,
    lowStockProducts,
    allTransactions,
    recentTransactions,
    mostSoldProduct,
    mostFrequentClient,
    mostUsedSupplier,
    totalSalesValue,
    totalPurchaseValue,
    totalStockValue,
    totalProfit,
    profitMarginPercent,
    roiValue,
    roiPercent
  };
};
