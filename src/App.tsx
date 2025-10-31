import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { SuppliersProvider } from './contexts/SuppliersContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { StockProvider } from './contexts/StockContext';
import { Toaster } from 'sonner';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { ScrollToTop } from './components/common/ScrollToTop';

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

// Purchases (Previously Stock Entries)
import StockEntryList from './pages/entradas/StockEntryList';
import StockEntryDetail from './pages/entradas/StockEntryDetail';
import StockEntryNew from './pages/entradas/StockEntryNew';
import StockEntryEdit from './pages/entradas/StockEntryEdit';

// Expenses
import ExpenseList from './pages/despesas/ExpenseList';
import ExpenseNew from './pages/despesas/ExpenseNew';
import ExpenseDetail from './pages/despesas/ExpenseDetail';
import ExpenseEdit from './pages/despesas/ExpenseEdit';

// Sales (Previously Stock Exits)
import StockExitList from './pages/saidas/StockExitList';
import StockExitDetail from './pages/saidas/StockExitDetail';
import StockExitNew from './pages/saidas/StockExitNew';
import StockExitEdit from './pages/saidas/StockExitEdit';

// Settings
import Settings from './pages/configuracoes/Settings';

// Statistics (Previously Support)
import Support from './pages/Suporte';

// Recycle bin
import Reciclagem from './pages/Reciclagem';

// Notifications
import NotificationsList from './pages/notificacoes/NotificationsList';

// Admin
import RoleManagement from './pages/admin/RoleManagement';
import DataManagement from './pages/admin/DataManagement';

// Reports
import ReportsDashboard from './pages/relatorios/ReportsDashboard';

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
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CategoriesProvider>
            <ProductsProvider>
              <ClientsProvider>
                <SuppliersProvider>
                  <OrdersProvider>
                    <StockProvider>
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
                    
                    <Route path="/entradas/historico" element={<StockEntryList />} />
                    <Route path="/entradas/nova" element={<StockEntryNew />} />
                    <Route path="/entradas/:id" element={<StockEntryDetail />} />
                    <Route path="/entradas/editar/:id" element={<StockEntryEdit />} />
                    
                    <Route path="/despesas/historico" element={<ExpenseList />} />
                    <Route path="/despesas/nova" element={<ExpenseNew />} />
                    <Route path="/despesas/:id" element={<ExpenseDetail />} />
                    <Route path="/despesas/editar/:id" element={<ExpenseEdit />} />
                    
                    <Route path="/saidas/historico" element={<StockExitList />} />
                    <Route path="/saidas/nova" element={<StockExitNew />} />
                    <Route path="/saidas/:id" element={<StockExitDetail />} />
                    <Route path="/saidas/editar/:id" element={<StockExitEdit />} />
                    
                    <Route path="/configuracoes" element={<Settings />} />
                    
                    <Route path="/reciclagem" element={<Reciclagem />} />
                    
                    <Route path="/notificacoes" element={<NotificationsList />} />
                    
                    <Route path="/relatorios" element={<ReportsDashboard />} />
                    
                    <Route path="/admin/roles" element={<RoleManagement />} />
                    <Route path="/admin/data" element={<DataManagement />} />
                    
                    <Route path="/suporte" element={<Support />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Suspense>
        </StockProvider>
      </OrdersProvider>
    </SuppliersProvider>
  </ClientsProvider>
</ProductsProvider>
</CategoriesProvider>
</AuthProvider>
</ThemeProvider>
</BrowserRouter>
  );
}

export default App;
