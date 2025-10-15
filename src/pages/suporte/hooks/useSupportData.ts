import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { SupportStats } from "../../types/supportTypes";

export const useSupportData = () => {
  const { products, categories, clients, suppliers, orders, purchases, stockEntries, stockExits, expenses } = useData();

  const [stats, setStats] = useState<SupportStats>({
    totals: {
      clients: 0,
      suppliers: 0,
      categories: 0,
      products: 0,
    },
    topProducts: [],
    topClients: [],
    topSuppliers: [],
    monthlyData: [],
    lowStockProducts: [],
    monthlyOrders: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!products.length && !categories.length && !clients.length && !suppliers.length) {
      return;
    }

    setIsLoading(true);

    // Totais simples e diretos (correto e rápido)
    const totals = {
      clients: clients.length,
      suppliers: suppliers.length,
      categories: categories.length,
      products: products.length,
    };

    // Produtos com baixo stock
    const lowStockProducts = products.filter((p) => p.stock_quantity <= (p.low_stock_threshold || 0)).slice(0, 5);

    // Top produtos mais vendidos
    const productSales: Record<string, number> = {};
    stockExits.forEach((exit) => {
      exit.items.forEach((item) => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });
    const topProducts = [...products]
      .map((p) => ({
        ...p,
        sold: productSales[p.id] || 0,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Clientes mais frequentes
    const clientSales: Record<string, number> = {};
    stockExits.forEach((exit) => {
      clientSales[exit.clientId] = (clientSales[exit.clientId] || 0) + 1;
    });
    const topClients = [...clients]
      .map((c) => ({
        ...c,
        orders: clientSales[c.id] || 0,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Fornecedores mais usados
    const supplierPurchases: Record<string, number> = {};
    stockEntries.forEach((entry) => {
      supplierPurchases[entry.supplierId] = (supplierPurchases[entry.supplierId] || 0) + 1;
    });
    const topSuppliers = [...suppliers]
      .map((s) => ({
        ...s,
        supplies: supplierPurchases[s.id] || 0,
      }))
      .sort((a, b) => b.supplies - a.supplies)
      .slice(0, 5);

    // Dados mensais de vendas e compras
    const monthlyDataMap: Record<string, { month: string; sales: number; purchases: number; profit: number }> = {};

    const processTransaction = (date: string | Date, amount: number, type: "sale" | "purchase") => {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          month: key,
          sales: 0,
          purchases: 0,
          profit: 0,
        };
      }
      if (type === "sale") monthlyDataMap[key].sales += amount;
      if (type === "purchase") monthlyDataMap[key].purchases += amount;
      monthlyDataMap[key].profit = monthlyDataMap[key].sales - monthlyDataMap[key].purchases;
    };

    stockExits.forEach((exit) =>
      exit.items.forEach((item) => processTransaction(exit.date, item.salePrice * item.quantity, "sale")),
    );
    stockEntries.forEach((entry) =>
      entry.items.forEach((item) => processTransaction(entry.date, item.purchasePrice * item.quantity, "purchase")),
    );

    const monthlyData = Object.values(monthlyDataMap).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
    );

    // Atualiza stats
    setStats({
      totals,
      topProducts,
      topClients,
      topSuppliers,
      monthlyData,
      lowStockProducts,
      monthlyOrders: orders.slice(-6),
    });

    setIsLoading(false);
  }, [products, categories, clients, suppliers, orders, purchases, stockEntries, stockExits, expenses]);

  return { stats, isLoading };
};
