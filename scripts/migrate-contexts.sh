#!/bin/bash

# This script updates all files to use the new separated context hooks
# Run this from the project root

echo "Migrating context imports..."

# Update all client-related files
find src/pages/clientes -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|import { useData } from '@/contexts/DataContext';|import { useClients } from '@/contexts/ClientsContext';\nimport { useStock } from '@/contexts/StockContext';|g" \
  -e "s|const { clients, getClient, addClient, updateClient, deleteClient, stockExits, isLoading } = useData();|const { clients, addClient, updateClient, deleteClient, isLoading } = useClients();\nconst { stockExits } = useStock();\nconst getClient = (id: string) => clients.find(c => c.id === id);|g" \
  {} \;

# Update all product-related files  
find src/pages/produtos -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|import { useData } from|import { useProducts } from '@/contexts/ProductsContext';\nimport { useCategories } from '@/contexts/CategoriesContext';\nimport { useData } from|g" \
  {} \;

# Update all supplier-related files
find src/pages/fornecedores -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|import { useData } from '@/contexts/DataContext';|import { useSuppliers } from '@/contexts/SuppliersContext';|g" \
  {} \;

# Update all order-related files
find src/pages/encomendas -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|import { useData } from '@/contexts/DataContext';|import { useOrders } from '@/contexts/OrdersContext';\nimport { useClients } from '@/contexts/ClientsContext';\nimport { useProducts } from '@/contexts/ProductsContext';\nimport { useStock } from '@/contexts/StockContext';|g" \
  {} \;

# Update all stock entry-related files
find src/pages/entradas -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|import { useData } from '@/contexts/DataContext';|import { useStock } from '@/contexts/StockContext';\nimport { useSuppliers } from '@/contexts/SuppliersContext';\nimport { useProducts } from '@/contexts/ProductsContext';|g" \
  {} \;

# Update all stock exit-related files
find src/pages/saidas -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s|import { useData } from '@/contexts/DataContext';|import { useStock } from '@/contexts/StockContext';\nimport { useClients } from '@/contexts/ClientsContext';\nimport { useProducts } from '@/contexts/ProductsContext';|g" \
  {} \;

echo "Migration complete!"
