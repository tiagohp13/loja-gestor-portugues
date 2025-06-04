
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from '@/components/ui/sonner';

// Import pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ProductList from '@/pages/produtos/ProductList';
import ProductDetail from '@/pages/produtos/ProductDetail';
import ProductNew from '@/pages/produtos/ProductNew';
import ProductEdit from '@/pages/produtos/ProductEdit';
import CategoryList from '@/pages/categorias/CategoryList';
import CategoryDetail from '@/pages/categorias/CategoryDetail';
import CategoryNew from '@/pages/categorias/CategoryNew';
import CategoryEdit from '@/pages/categorias/CategoryEdit';
import ClientList from '@/pages/clientes/ClientList';
import ClientDetail from '@/pages/clientes/ClientDetail';
import ClientNew from '@/pages/clientes/ClientNew';
import ClientEdit from '@/pages/clientes/ClientEdit';
import SupplierList from '@/pages/fornecedores/SupplierList';
import SupplierDetail from '@/pages/fornecedores/SupplierDetail';
import SupplierNew from '@/pages/fornecedores/SupplierNew';
import SupplierEdit from '@/pages/fornecedores/SupplierEdit';
import StockEntryList from '@/pages/entradas/StockEntryList';
import StockEntryDetail from '@/pages/entradas/StockEntryDetail';
import StockEntryNew from '@/pages/entradas/StockEntryNew';
import StockEntryEdit from '@/pages/entradas/StockEntryEdit';
import StockExitList from '@/pages/saidas/StockExitList';
import StockExitDetail from '@/pages/saidas/StockExitDetail';
import StockExitNew from '@/pages/saidas/StockExitNew';
import StockExitEdit from '@/pages/saidas/StockExitEdit';
import OrderList from '@/pages/encomendas/OrderList';
import OrderDetail from '@/pages/encomendas/OrderDetail';
import OrderNew from '@/pages/encomendas/OrderNew';
import OrderEdit from '@/pages/encomendas/OrderEdit';
import ExpenseList from '@/pages/despesas/ExpenseList';
import ExpenseNew from '@/pages/despesas/ExpenseNew';
import ExpenseDetail from '@/pages/despesas/ExpenseDetail';
import TransactionList from '@/pages/transacoes/TransactionList';
import Suporte from '@/pages/Suporte';
import Settings from '@/pages/configuracoes/Settings';
import NotFound from '@/pages/NotFound';

// Import layouts
import AppLayout from '@/components/layouts/AppLayout';
import AuthLayout from '@/components/layouts/AuthLayout';

// Import services
import { getCurrentUser } from '@/services/authService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      };
      checkAuth();
    }, []);

    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <AuthProvider>
            <Router>
              <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
                <Routes>
                  <Route path="/login" element={
                    <AuthLayout>
                      <Login />
                    </AuthLayout>
                  } />
                  <Route path="/register" element={
                    <AuthLayout>
                      <Register />
                    </AuthLayout>
                  } />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          <Routes>
                            <Route index element={<Dashboard />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="produtos" element={<ProductList />} />
                            <Route path="produtos/novo" element={<ProductNew />} />
                            <Route path="produtos/:id" element={<ProductDetail />} />
                            <Route path="produtos/:id/editar" element={<ProductEdit />} />
                            <Route path="categorias" element={<CategoryList />} />
                            <Route path="categorias/nova" element={<CategoryNew />} />
                            <Route path="categorias/:id" element={<CategoryDetail />} />
                            <Route path="categorias/:id/editar" element={<CategoryEdit />} />
                            <Route path="clientes" element={<ClientList />} />
                            <Route path="clientes/novo" element={<ClientNew />} />
                            <Route path="clientes/detalhe/:id" element={<ClientDetail />} />
                            <Route path="clientes/:id/editar" element={<ClientEdit />} />
                            <Route path="fornecedores" element={<SupplierList />} />
                            <Route path="fornecedores/novo" element={<SupplierNew />} />
                            <Route path="fornecedores/:id" element={<SupplierDetail />} />
                            <Route path="fornecedores/:id/editar" element={<SupplierEdit />} />
                            <Route path="entradas" element={<StockEntryList />} />
                            <Route path="entradas/nova" element={<StockEntryNew />} />
                            <Route path="entradas/:id" element={<StockEntryDetail />} />
                            <Route path="entradas/:id/editar" element={<StockEntryEdit />} />
                            <Route path="saidas" element={<StockExitList />} />
                            <Route path="saidas/nova" element={<StockExitNew />} />
                            <Route path="saidas/:id" element={<StockExitDetail />} />
                            <Route path="saidas/:id/editar" element={<StockExitEdit />} />
                            <Route path="encomendas" element={<OrderList />} />
                            <Route path="encomendas/nova" element={<OrderNew />} />
                            <Route path="encomendas/:id" element={<OrderDetail />} />
                            <Route path="encomendas/:id/editar" element={<OrderEdit />} />
                            <Route path="despesas" element={<ExpenseList />} />
                            <Route path="despesas/nova" element={<ExpenseNew />} />
                            <Route path="despesas/:id" element={<ExpenseDetail />} />
                            <Route path="transacoes" element={<TransactionList />} />
                            <Route path="estatisticas" element={<Suporte />} />
                            <Route path="configuracoes" element={<Settings />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </DataProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
