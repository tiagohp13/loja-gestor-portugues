
import { User, Product, Client, Supplier, StockEntry, StockExit } from '../types';

// Mock Users
export const users: User[] = [
  { id: '1', name: 'Administrador', email: 'admin@gestor.pt', role: 'admin' },
  { id: '2', name: 'Utilizador', email: 'user@gestor.pt', role: 'user' },
];

// Empty initial data
export const products: Product[] = [];
export const clients: Client[] = [];
export const suppliers: Supplier[] = [];
export const stockEntries: StockEntry[] = [];
export const stockExits: StockExit[] = [];

// Helper function to get a product with its stock movements
export const getProductWithHistory = (productId: string) => {
  const product = products.find(p => p.id === productId);
  const entries = stockEntries.filter(e => e.productId === productId).map(entry => {
    return {
      ...entry,
      supplier: suppliers.find(s => s.id === entry.supplierId)
    };
  });
  const exits = stockExits.filter(e => e.productId === productId).map(exit => {
    return {
      ...exit,
      client: clients.find(c => c.id === exit.clientId)
    };
  });

  return {
    product,
    entries,
    exits
  };
};

// Helper function to get a client with purchase history
export const getClientWithHistory = (clientId: string) => {
  const client = clients.find(c => c.id === clientId);
  const purchases = stockExits.filter(e => e.clientId === clientId).map(exit => {
    return {
      ...exit,
      product: products.find(p => p.id === exit.productId)
    };
  });

  return {
    client,
    purchases
  };
};

// Helper function to get a supplier with delivery history
export const getSupplierWithHistory = (supplierId: string) => {
  const supplier = suppliers.find(s => s.id === supplierId);
  const deliveries = stockEntries.filter(e => e.supplierId === supplierId).map(entry => {
    return {
      ...entry,
      product: products.find(p => p.id === entry.productId)
    };
  });

  return {
    supplier,
    deliveries
  };
};

// Helper to get dashboard data
export const getDashboardData = () => {
  // Total stock value
  const totalStockValue = products.reduce((sum, product) => {
    return sum + (product.currentStock * product.purchasePrice);
  }, 0);

  // Total sales value
  const totalSalesValue = stockExits.reduce((sum, exit) => {
    return sum + (exit.quantity * exit.salePrice);
  }, 0);

  // Most sold product
  const productSales: Record<string, number> = {};
  stockExits.forEach(exit => {
    if (!productSales[exit.productId]) {
      productSales[exit.productId] = 0;
    }
    productSales[exit.productId] += exit.quantity;
  });
  
  let mostSoldProductId = '';
  let mostSoldQuantity = 0;
  
  Object.entries(productSales).forEach(([productId, quantity]) => {
    if (quantity > mostSoldQuantity) {
      mostSoldProductId = productId;
      mostSoldQuantity = quantity;
    }
  });
  
  const mostSoldProduct = products.find(p => p.id === mostSoldProductId);

  // Most frequent client
  const clientPurchases: Record<string, number> = {};
  stockExits.forEach(exit => {
    if (!clientPurchases[exit.clientId]) {
      clientPurchases[exit.clientId] = 0;
    }
    clientPurchases[exit.clientId]++;
  });
  
  let mostFrequentClientId = '';
  let mostPurchasesCount = 0;
  
  Object.entries(clientPurchases).forEach(([clientId, count]) => {
    if (count > mostPurchasesCount) {
      mostFrequentClientId = clientId;
      mostPurchasesCount = count;
    }
  });
  
  const mostFrequentClient = clients.find(c => c.id === mostFrequentClientId);

  // Most used supplier
  const supplierDeliveries: Record<string, number> = {};
  stockEntries.forEach(entry => {
    if (!supplierDeliveries[entry.supplierId]) {
      supplierDeliveries[entry.supplierId] = 0;
    }
    supplierDeliveries[entry.supplierId]++;
  });
  
  let mostUsedSupplierId = '';
  let mostDeliveriesCount = 0;
  
  Object.entries(supplierDeliveries).forEach(([supplierId, count]) => {
    if (count > mostDeliveriesCount) {
      mostUsedSupplierId = supplierId;
      mostDeliveriesCount = count;
    }
  });
  
  const mostUsedSupplier = suppliers.find(s => s.id === mostUsedSupplierId);

  // Low stock products
  const lowStockThreshold = 5;
  const lowStockProducts = products.filter(p => p.currentStock <= lowStockThreshold);

  // Recent transactions
  const recentTransactions = [...stockEntries, ...stockExits]
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 5)
    .map(transaction => {
      const isEntry = 'invoiceNumber' in transaction;
      return {
        id: transaction.id,
        date: transaction.date,
        type: isEntry ? 'entry' : 'exit',
        product: products.find(p => p.id === transaction.productId),
        quantity: transaction.quantity,
        value: isEntry 
          ? transaction.quantity * transaction.purchasePrice 
          : transaction.quantity * transaction.salePrice,
        entity: isEntry 
          ? suppliers.find(s => s.id === (transaction as StockEntry).supplierId)?.name 
          : clients.find(c => c.id === (transaction as StockExit).clientId)?.name
      };
    });

  return {
    totalProducts: products.length,
    totalClients: clients.length,
    totalSuppliers: suppliers.length,
    totalStockValue,
    totalSalesValue,
    mostSoldProduct,
    mostFrequentClient,
    mostUsedSupplier,
    lowStockProducts,
    recentTransactions
  };
};
