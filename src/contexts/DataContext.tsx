import React, { createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { Product, Client, Order, StockEntry, StockExit, ExportDataType } from "../types";
import { useProducts } from "./ProductsContext";
import { useCategories } from "./CategoriesContext";
import { useClients } from "./ClientsContext";
import { useSuppliers } from "./SuppliersContext";
import { useOrders } from "./OrdersContext";
import { useStock } from "./StockContext";

interface DataContextType {
  // History functions
  getProductHistory: (id: string) => { entries: StockEntry[]; exits: StockExit[] };
  getClientHistory: (id: string) => { orders: Order[]; exits: StockExit[] };
  getSupplierHistory: (id: string) => { entries: StockEntry[] };

  // Conversion
  convertOrderToStockExit: (orderId: string, invoiceNumber?: string) => Promise<StockExit | undefined>;

  // Export/Import
  exportData: (type: ExportDataType) => void;

  // Business Analytics
  getBusinessAnalytics: () => {
    totalProducts: number;
    totalCategories: number;
    totalClients: number;
    totalSuppliers: number;
    totalOrders: number;
    totalStockEntries: number;
    totalStockExits: number;
    lowStockProducts: Product[];
    summary: {
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
      profitMargin: number;
      currentStockValue: number;
    };
    topSellingProducts: { id: string; name: string; totalQuantity: number; totalRevenue: number }[];
    mostProfitableProducts: { id: string; name: string; totalQuantity: number; totalRevenue: number }[];
    topClients: { id: string; name: string; purchaseCount: number; totalSpent: number; lastPurchaseDate: string }[];
    inactiveClients: {
      id: string;
      name: string;
      purchaseCount: number;
      totalSpent: number;
      lastPurchaseDate: string;
    }[];
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { clients } = useClients();
  const { suppliers } = useSuppliers();
  const { orders, setOrders } = useOrders();
  const { stockEntries, stockExits, addStockExit } = useStock();

  const getProductHistory = (id: string) => {
    const entries = stockEntries.filter((entry) => entry.items.some((item) => item.productId === id));
    const exits = stockExits.filter((exit) => exit.items.some((item) => item.productId === id));
    return { entries, exits };
  };

  const getClientHistory = (id: string) => {
    const clientOrders = orders.filter((order) => order.clientId === id);
    const clientExits = stockExits.filter((exit) => exit.clientId === id);
    return { orders: clientOrders, exits: clientExits };
  };

  const getSupplierHistory = (id: string) => {
    const supplierEntries = stockEntries.filter((entry) => entry.supplierId === id);
    return { entries: supplierEntries };
  };

  const convertOrderToStockExit = async (orderId: string, invoiceNumber?: string): Promise<StockExit | undefined> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const stockExit: Omit<StockExit, "id" | "number" | "createdAt"> = {
      clientId: order.clientId,
      clientName: order.clientName || "",
      date: order.date,
      invoiceNumber: invoiceNumber || "",
      notes: `Converted from order ${order.number}`,
      fromOrderId: order.id,
      fromOrderNumber: order.number,
      discount: order.discount || 0,
      updatedAt: new Date().toISOString(),
      items: order.items.map((item) => ({
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        salePrice: item.salePrice,
        discountPercent: item.discountPercent || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    const result = await addStockExit(stockExit);

    // Update local orders state to reflect conversion
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              convertedToStockExitId: result.id,
              convertedToStockExitNumber: result.number,
            }
          : o
      )
    );

    return result;
  };

  const getBusinessAnalytics = () => {
    const basicAnalytics = {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalClients: clients.length,
      totalSuppliers: suppliers.length,
      totalOrders: orders.length,
      totalStockEntries: stockEntries.length,
      totalStockExits: stockExits.length,
      lowStockProducts: products.filter((p) => p.currentStock <= p.minStock),
    };

    const totalRevenue = stockExits.reduce((sum, exit) => {
      const exitTotal = exit.items.reduce((itemSum, item) => {
        const itemPrice = item.salePrice * item.quantity;
        const discountAmount = item.discountPercent ? (itemPrice * item.discountPercent) / 100 : 0;
        return itemSum + (itemPrice - discountAmount);
      }, 0);

      const orderDiscount = exit.discount || 0;
      return sum + exitTotal * (1 - orderDiscount / 100);
    }, 0);

    const totalCost = stockEntries.reduce((sum, entry) => {
      return (
        sum +
        entry.items.reduce((itemSum, item) => {
          return itemSum + item.purchasePrice * item.quantity;
        }, 0)
      );
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const currentStockValue = products.reduce((sum, product) => {
      return sum + product.purchasePrice * product.currentStock;
    }, 0);

    const productSales = products
      .map((product) => {
        const totalQuantity = stockExits.reduce((sum, exit) => {
          const productItems = exit.items.filter((item) => item.productId === product.id);
          return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const totalRevenue = stockExits.reduce((sum, exit) => {
          const productItems = exit.items.filter((item) => item.productId === product.id);
          return (
            sum +
            productItems.reduce((itemSum, item) => {
              const itemTotal = item.salePrice * item.quantity;
              const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
              return itemSum + (itemTotal - discountAmount);
            }, 0)
          );
        }, 0);

        return {
          id: product.id,
          name: product.name,
          totalQuantity,
          totalRevenue,
        };
      })
      .filter((p) => p.totalQuantity > 0)
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    const clientPurchases = clients
      .map((client) => {
        const clientExits = stockExits.filter((exit) => exit.clientId === client.id);
        const purchaseCount = clientExits.length;

        const totalSpent = clientExits.reduce((sum, exit) => {
          const exitTotal = exit.items.reduce((itemSum, item) => {
            const itemTotal = item.salePrice * item.quantity;
            const discountAmount = item.discountPercent ? (itemTotal * item.discountPercent) / 100 : 0;
            return itemSum + (itemTotal - discountAmount);
          }, 0);

          const orderDiscount = exit.discount || 0;
          return sum + exitTotal * (1 - orderDiscount / 100);
        }, 0);

        let lastPurchaseDate = "Nunca";
        if (clientExits.length > 0) {
          const sortedExits = [...clientExits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          lastPurchaseDate = sortedExits[0].date;
        }

        return {
          id: client.id,
          name: client.name,
          purchaseCount,
          totalSpent,
          lastPurchaseDate,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveClients = clientPurchases
      .filter((client) => {
        if (client.lastPurchaseDate === "Nunca") return true;

        const lastPurchase = new Date(client.lastPurchaseDate);
        return lastPurchase < thirtyDaysAgo;
      })
      .sort((a, b) => {
        if (a.lastPurchaseDate === "Nunca" && b.lastPurchaseDate === "Nunca") return 0;
        if (a.lastPurchaseDate === "Nunca") return -1;
        if (b.lastPurchaseDate === "Nunca") return 1;

        return new Date(a.lastPurchaseDate).getTime() - new Date(b.lastPurchaseDate).getTime();
      });

    return {
      ...basicAnalytics,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        currentStockValue,
      },
      topSellingProducts: productSales.slice(0, 5),
      mostProfitableProducts: [...productSales].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5),
      topClients: clientPurchases.slice(0, 5),
      inactiveClients,
    };
  };

  const exportData = (type: ExportDataType) => {
    try {
      let dataToExport: any = {};

      switch (type) {
        case "products":
          dataToExport = products;
          break;
        case "categories":
          dataToExport = categories;
          break;
        case "clients":
          dataToExport = clients;
          break;
        case "suppliers":
          dataToExport = suppliers;
          break;
        case "orders":
          dataToExport = orders;
          break;
        case "stockEntries":
          dataToExport = stockEntries;
          break;
        case "stockExits":
          dataToExport = stockExits;
          break;
        case "expenses":
          dataToExport = [];
          break;
        case "all":
          dataToExport = {
            products,
            categories,
            clients,
            suppliers,
            orders,
            stockEntries,
            stockExits,
          };
          break;
        default:
          toast.error("Tipo de exportação inválido");
          return;
      }

      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `crm-${type}-backup-${timestamp}.json`;
      link.click();

      toast.success(`Exportação de ${type} concluída com sucesso!`);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  return (
    <DataContext.Provider
      value={{
        getProductHistory,
        getClientHistory,
        getSupplierHistory,
        convertOrderToStockExit,
        exportData,
        getBusinessAnalytics,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
