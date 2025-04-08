
import { User, Product, Client, Supplier, StockEntry, StockExit, Category, Order } from '../types';

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
export const categories: Category[] = [];
export const orders: Order[] = [];

// Helper function to get a product with its stock movements
export const getProductWithHistory = (productId: string) => {
  const product = products.find(p => p.id === productId);
  
  // Filter entries and exits where this product is included in the items array
  const entries = stockEntries
    .filter(entry => entry.items.some(item => item.productId === productId))
    .map(entry => {
      return {
        ...entry,
        supplier: suppliers.find(s => s.id === entry.supplierId)
      };
    });
    
  const exits = stockExits
    .filter(exit => exit.items.some(item => item.productId === productId))
    .map(exit => {
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
  
  const purchases = stockExits
    .filter(exit => exit.clientId === clientId)
    .map(exit => {
      // For each exit, map all items that were part of it
      const exitItems = exit.items.map(item => {
        return {
          ...item,
          exitId: exit.id,
          exitDate: exit.date,
          product: products.find(p => p.id === item.productId)
        };
      });
      
      return {
        exit,
        items: exitItems
      };
    });

  return {
    client,
    purchases: purchases.flatMap(p => p.items) // Flatten to get all items
  };
};

// Helper function to get a supplier with delivery history
export const getSupplierWithHistory = (supplierId: string) => {
  const supplier = suppliers.find(s => s.id === supplierId);
  
  const deliveries = stockEntries
    .filter(entry => entry.supplierId === supplierId)
    .map(entry => {
      // For each entry, map all items that were part of it
      const entryItems = entry.items.map(item => {
        return {
          ...item,
          entryId: entry.id,
          entryDate: entry.date,
          product: products.find(p => p.id === item.productId)
        };
      });
      
      return {
        entry,
        items: entryItems
      };
    });

  return {
    supplier,
    deliveries: deliveries.flatMap(d => d.items) // Flatten to get all items
  };
};

// Helper to get dashboard data
export const getDashboardData = () => {
  // Ensure we have data to process
  if (products.length === 0) {
    return {
      totalProducts: 0,
      totalClients: 0,
      totalSuppliers: 0,
      totalStockValue: 0,
      totalSalesValue: 0,
      mostSoldProduct: null,
      mostFrequentClient: null,
      mostUsedSupplier: null,
      lowStockProducts: [],
      recentTransactions: []
    };
  }

  // Total stock value
  const totalStockValue = products.reduce((sum, product) => {
    return sum + (product.currentStock * product.purchasePrice);
  }, 0);

  // Total sales value - calculate from all items in all exits
  const totalSalesValue = stockExits.reduce((sum, exit) => {
    const exitTotal = exit.items.reduce((itemSum, item) => 
      itemSum + (item.quantity * item.salePrice), 0);
    return sum + exitTotal;
  }, 0);

  // Most sold product
  const productSales: Record<string, number> = {};
  
  // Count total quantity sold for each product across all exits
  stockExits.forEach(exit => {
    exit.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = 0;
      }
      productSales[item.productId] += item.quantity;
    });
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

  // Low stock products - now checking against minStock instead of fixed value
  const lowStockProducts = products.filter(p => p.currentStock <= (p.minStock || 5));

  // Recent transactions - ensure we can combine and sort
  const allTransactions = [
    ...stockEntries.flatMap(entry => entry.items.map(item => ({
      id: entry.id,
      date: entry.date,
      type: 'entry' as const,
      productId: item.productId,
      quantity: item.quantity,
      price: item.purchasePrice,
      entityId: entry.supplierId,
      createdAt: entry.createdAt
    }))),
    ...stockExits.flatMap(exit => exit.items.map(item => ({
      id: exit.id,
      date: exit.date,
      type: 'exit' as const,
      productId: item.productId,
      quantity: item.quantity,
      price: item.salePrice,
      entityId: exit.clientId,
      createdAt: exit.createdAt
    })))
  ];

  const sortedTransactions = allTransactions.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Most recent first
  });

  const recentTransactions = sortedTransactions.slice(0, 5).map(transaction => {
    const product = products.find(p => p.id === transaction.productId);
    const entity = transaction.type === 'entry'
      ? suppliers.find(s => s.id === transaction.entityId)
      : clients.find(c => c.id === transaction.entityId);

    return {
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      product,
      quantity: transaction.quantity,
      value: transaction.quantity * transaction.price,
      entity: entity?.name || 'Desconhecido'
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
