import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from 'sonner';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';

// Authentication
import LoginPage from './pages/Login';

// Dashboard
import DashboardPage from './pages/Dashboard';

// Products
import ProductList from './pages/produtos/ProductList';
import ProductDetail from './pages/produtos/ProductDetail';
import ProductNew from './pages/produtos/ProductNew';
import ProductEdit from './pages/produtos/ProductEdit';

// Categories
import CategoryList from './pages/categorias/CategoryList';
import CategoryDetail from './pages/categorias/CategoryDetail';
import CategoryNew from './pages/categorias/CategoryNew';
import CategoryEdit from './pages/categorias/CategoryEdit';

// Clients
import ClientList from './pages/clientes/ClientList';
import ClientDetail from './pages/clientes/ClientDetail';
import ClientNew from './pages/clientes/ClientNew';
import ClientEdit from './pages/clientes/ClientEdit';

// Suppliers
import SupplierList from './pages/fornecedores/SupplierList';
import SupplierDetail from './pages/fornecedores/SupplierDetail';
import SupplierNew from './pages/fornecedores/SupplierNew';
import SupplierEdit from './pages/fornecedores/SupplierEdit';

// Orders
import OrderList from './pages/encomendas/OrderList';
import OrderDetail from './pages/encomendas/OrderDetail';
import OrderNew from './pages/encomendas/OrderNew';
import OrderEdit from './pages/encomendas/OrderEdit';
import OrderConverting from './pages/encomendas/OrderConverting';

// Purchases (Previously Stock Entries)
import StockEntryList from './pages/entradas/StockEntryList';
import StockEntryDetail from './pages/entradas/StockEntryDetail';
import StockEntryNew from './pages/entradas/StockEntryNew';
import StockEntryEdit from './pages/entradas/StockEntryEdit';

// Sales (Previously Stock Exits)
import StockExitList from './pages/saidas/StockExitList';
import StockExitDetail from './pages/saidas/StockExitDetail';
import StockExitNew from './pages/saidas/StockExitNew';
import StockExitEdit from './pages/saidas/StockExitEdit';

// Settings
import Settings from './pages/configuracoes/Settings';

// Statistics (Previously Support)
import Support from './pages/Suporte';

// Error pages
import NotFound from './pages/NotFound';

// Layout
import AppLayout from './components/layouts/AppLayout';

// Auth Route Guard
const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();
  
  if (!isInitialized) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated === false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  
                  <Route path="/produtos/consultar" element={<ProductList />} />
                  <Route path="/produtos/novo" element={<ProductNew />} />
                  <Route path="/produtos/:id" element={<ProductDetail />} />
                  <Route path="/produtos/editar/:id" element={<ProductEdit />} />
                  
                  <Route path="/categorias/consultar" element={<CategoryList />} />
                  <Route path="/categorias/nova" element={<CategoryNew />} />
                  <Route path="/categorias/:id" element={<CategoryDetail />} />
                  <Route path="/categorias/editar/:id" element={<CategoryEdit />} />
                  
                  <Route path="/clientes/consultar" element={<ClientList />} />
                  <Route path="/clientes/novo" element={<ClientNew />} />
                  <Route path="/clientes/:id" element={<ClientDetail />} />
                  <Route path="/clientes/editar/:id" element={<ClientEdit />} />
                  
                  <Route path="/fornecedores/consultar" element={<SupplierList />} />
                  <Route path="/fornecedores/novo" element={<SupplierNew />} />
                  <Route path="/fornecedores/:id" element={<SupplierDetail />} />
                  <Route path="/fornecedores/editar/:id" element={<SupplierEdit />} />
                  
                  <Route path="/encomendas/consultar" element={<OrderList />} />
                  <Route path="/encomendas/nova" element={<OrderNew />} />
                  <Route path="/encomendas/:id" element={<OrderDetail />} />
                  <Route path="/encomendas/editar/:id" element={<OrderEdit />} />
                  <Route path="/encomendas/converter/:id" element={<OrderConverting />} />
                  
                  <Route path="/entradas/historico" element={<StockEntryList />} />
                  <Route path="/entradas/nova" element={<StockEntryNew />} />
                  <Route path="/entradas/:id" element={<StockEntryDetail />} />
                  <Route path="/entradas/editar/:id" element={<StockEntryEdit />} />
                  
                  <Route path="/saidas/historico" element={<StockExitList />} />
                  <Route path="/saidas/nova" element={<StockExitNew />} />
                  <Route path="/saidas/:id" element={<StockExitDetail />} />
                  <Route path="/saidas/editar/:id" element={<StockExitEdit />} />
                  
                  <Route path="/configuracoes" element={<Settings />} />
                  
                  <Route path="/suporte" element={<Support />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Suspense>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
