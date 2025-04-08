import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from 'sonner';

// Authentication
import { LoginPage } from './pages';

// Dashboard
import { DashboardPage } from './pages';

// Products
import { ProductList, ProductDetail, ProductNew, ProductEdit } from './pages';

// Categories
import { CategoryList, CategoryDetail, CategoryNew, CategoryEdit } from './pages';

// Clients
import { ClientList, ClientDetail, ClientNew, ClientEdit } from './pages';

// Suppliers
import { SupplierList, SupplierDetail, SupplierNew, SupplierEdit } from './pages';

// Orders
import { OrderList, OrderDetail, OrderNew, OrderConverting } from './pages';

// Stock Entries
import { StockEntryList, StockEntryNew, StockEntryEdit } from './pages';

// Stock Exits
import { StockExitList, StockExitNew, StockExitEdit } from './pages';

// Settings
import { Settings } from './pages';

// Support
import { Support } from './pages';

// Error pages
import { NotFound } from './pages';

// Layout
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Products */}
              <Route path="/produtos/consultar" element={<ProductList />} />
              <Route path="/produtos/novo" element={<ProductNew />} />
              <Route path="/produtos/:id" element={<ProductDetail />} />
              <Route path="/produtos/editar/:id" element={<ProductEdit />} />
              
              {/* Categories */}
              <Route path="/categorias/consultar" element={<CategoryList />} />
              <Route path="/categorias/nova" element={<CategoryNew />} />
              <Route path="/categorias/:id" element={<CategoryDetail />} />
              <Route path="/categorias/editar/:id" element={<CategoryEdit />} />
              
              {/* Clients */}
              <Route path="/clientes/consultar" element={<ClientList />} />
              <Route path="/clientes/novo" element={<ClientNew />} />
              <Route path="/clientes/:id" element={<ClientDetail />} />
              <Route path="/clientes/editar/:id" element={<ClientEdit />} />
              
              {/* Suppliers */}
              <Route path="/fornecedores/consultar" element={<SupplierList />} />
              <Route path="/fornecedores/novo" element={<SupplierNew />} />
              <Route path="/fornecedores/:id" element={<SupplierDetail />} />
              <Route path="/fornecedores/editar/:id" element={<SupplierEdit />} />
              
              {/* Orders */}
              <Route path="/encomendas/consultar" element={<OrderList />} />
              <Route path="/encomendas/nova" element={<OrderNew />} />
              <Route path="/encomendas/:id" element={<OrderDetail />} />
              <Route path="/encomendas/converter/:id" element={<OrderConverting />} />
              
              {/* Stock Entries */}
              <Route path="/entradas/historico" element={<StockEntryList />} />
              <Route path="/entradas/nova" element={<StockEntryNew />} />
              <Route path="/entradas/editar/:id" element={<StockEntryEdit />} />
              
              {/* Stock Exits */}
              <Route path="/saidas/historico" element={<StockExitList />} />
              <Route path="/saidas/nova" element={<StockExitNew />} />
              <Route path="/saidas/editar/:id" element={<StockExitEdit />} />
              
              {/* Settings */}
              <Route path="/configuracoes" element={<Settings />} />
              
              {/* Support */}
              <Route path="/suporte" element={<Support />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
