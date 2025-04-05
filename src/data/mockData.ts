
import { User, Product, Client, Supplier, StockEntry, StockExit } from '../types';

// Mock Users
export const users: User[] = [
  { id: '1', name: 'Administrador', email: 'admin@gestor.pt', role: 'admin' },
  { id: '2', name: 'Utilizador', email: 'user@gestor.pt', role: 'user' },
];

// Mock Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Cadeira de Escritório',
    category: 'Mobiliário',
    code: 'CAD001',
    purchasePrice: 75.99,
    salePrice: 149.99,
    currentStock: 15,
    image: 'https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?q=80&w=200',
    description: 'Cadeira ergonómica de escritório',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Mesa de Jantar',
    category: 'Mobiliário',
    code: 'MES002',
    purchasePrice: 199.50,
    salePrice: 399.99,
    currentStock: 8,
    image: 'https://images.unsplash.com/photo-1594147216161-8532f5cc3c2a?q=80&w=200',
    description: 'Mesa de jantar em madeira maciça',
    createdAt: new Date('2023-01-18'),
    updatedAt: new Date('2023-01-18'),
  },
  {
    id: '3',
    name: 'Candeeiro de Pé',
    category: 'Iluminação',
    code: 'CND003',
    purchasePrice: 45.75,
    salePrice: 89.99,
    currentStock: 12,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=200',
    description: 'Candeeiro de pé moderno',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
  },
  {
    id: '4',
    name: 'Sofá de 3 Lugares',
    category: 'Mobiliário',
    code: 'SOF004',
    purchasePrice: 450.00,
    salePrice: 899.99,
    currentStock: 5,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=200',
    description: 'Sofá de 3 lugares em tecido',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
  },
  {
    id: '5',
    name: 'Estante de Livros',
    category: 'Mobiliário',
    code: 'EST005',
    purchasePrice: 120.50,
    salePrice: 249.99,
    currentStock: 10,
    image: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?q=80&w=200',
    description: 'Estante de livros modular',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01'),
  },
];

// Mock Clients
export const clients: Client[] = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '912345678',
    email: 'ana.silva@email.pt',
    address: 'Rua das Flores, 123, Lisboa',
    notes: 'Cliente regular',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-01-10'),
  },
  {
    id: '2',
    name: 'Carlos Santos',
    phone: '926789012',
    email: 'carlos.santos@email.pt',
    address: 'Avenida da República, 45, Porto',
    notes: 'Prefere entregas ao fim-de-semana',
    createdAt: new Date('2023-01-12'),
    updatedAt: new Date('2023-01-12'),
  },
  {
    id: '3',
    name: 'Maria Lopes',
    phone: '933456789',
    email: 'maria.lopes@email.pt',
    address: 'Praça do Comércio, 7, Faro',
    notes: '',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '4',
    name: 'João Ferreira',
    phone: '965432109',
    email: 'joao.ferreira@email.pt',
    address: 'Rua da Boavista, 28, Braga',
    notes: 'Cliente empresarial',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
  },
];

// Mock Suppliers
export const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Móveis Portugal, Lda.',
    phone: '210123456',
    email: 'vendas@moveisportugal.pt',
    address: 'Zona Industrial, Lote 12, Santarém',
    notes: 'Fornecedor principal',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05'),
  },
  {
    id: '2',
    name: 'Iluminação & Cª',
    phone: '220987654',
    email: 'comercial@iluminacao.pt',
    address: 'Rua da Indústria, 45, Aveiro',
    notes: '',
    createdAt: new Date('2023-01-08'),
    updatedAt: new Date('2023-01-08'),
  },
  {
    id: '3',
    name: 'Decoração Nacional',
    phone: '239876543',
    email: 'info@decoracaonacional.pt',
    address: 'Avenida das Artes, 78, Coimbra',
    notes: 'Entrega rápida',
    createdAt: new Date('2023-01-12'),
    updatedAt: new Date('2023-01-12'),
  },
];

// Mock Stock Entries
export const stockEntries: StockEntry[] = [
  {
    id: '1',
    productId: '1',
    supplierId: '1',
    quantity: 10,
    purchasePrice: 75.99,
    invoiceNumber: 'FAT20230105',
    date: new Date('2023-01-05'),
    createdAt: new Date('2023-01-05'),
  },
  {
    id: '2',
    productId: '2',
    supplierId: '1',
    quantity: 5,
    purchasePrice: 199.50,
    invoiceNumber: 'FAT20230110',
    date: new Date('2023-01-10'),
    createdAt: new Date('2023-01-10'),
  },
  {
    id: '3',
    productId: '3',
    supplierId: '2',
    quantity: 8,
    purchasePrice: 45.75,
    invoiceNumber: 'FAT20230115',
    date: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '4',
    productId: '4',
    supplierId: '1',
    quantity: 3,
    purchasePrice: 450.00,
    invoiceNumber: 'FAT20230120',
    date: new Date('2023-01-20'),
    createdAt: new Date('2023-01-20'),
  },
  {
    id: '5',
    productId: '5',
    supplierId: '3',
    quantity: 6,
    purchasePrice: 120.50,
    invoiceNumber: 'FAT20230125',
    date: new Date('2023-01-25'),
    createdAt: new Date('2023-01-25'),
  },
  {
    id: '6',
    productId: '1',
    supplierId: '1',
    quantity: 5,
    purchasePrice: 75.99,
    invoiceNumber: 'FAT20230205',
    date: new Date('2023-02-05'),
    createdAt: new Date('2023-02-05'),
  },
];

// Mock Stock Exits
export const stockExits: StockExit[] = [
  {
    id: '1',
    productId: '1',
    clientId: '1',
    quantity: 2,
    salePrice: 149.99,
    date: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    productId: '2',
    clientId: '2',
    quantity: 1,
    salePrice: 399.99,
    date: new Date('2023-01-20'),
    createdAt: new Date('2023-01-20'),
  },
  {
    id: '3',
    productId: '3',
    clientId: '3',
    quantity: 2,
    salePrice: 89.99,
    date: new Date('2023-01-25'),
    createdAt: new Date('2023-01-25'),
  },
  {
    id: '4',
    productId: '4',
    clientId: '4',
    quantity: 1,
    salePrice: 899.99,
    date: new Date('2023-02-01'),
    createdAt: new Date('2023-02-01'),
  },
  {
    id: '5',
    productId: '5',
    clientId: '1',
    quantity: 1,
    salePrice: 249.99,
    date: new Date('2023-02-05'),
    createdAt: new Date('2023-02-05'),
  },
  {
    id: '6',
    productId: '1',
    clientId: '3',
    quantity: 1,
    salePrice: 149.99,
    date: new Date('2023-02-10'),
    createdAt: new Date('2023-02-10'),
  },
];

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
    .sort((a, b) => b.date.getTime() - a.date.getTime())
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
