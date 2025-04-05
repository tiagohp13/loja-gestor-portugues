
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layouts/AppLayout";

// Product routes
import ProductNew from "./pages/produtos/ProductNew";
import ProductList from "./pages/produtos/ProductList";

// Client routes
import ClientNew from "./pages/clientes/ClientNew";
import ClientList from "./pages/clientes/ClientList";

// Supplier routes
import SupplierNew from "./pages/fornecedores/SupplierNew";
import SupplierList from "./pages/fornecedores/SupplierList";

// Stock routes
import StockEntryNew from "./pages/entradas/StockEntryNew";
import StockEntryList from "./pages/entradas/StockEntryList";
import StockExitNew from "./pages/saidas/StockExitNew";
import StockExitList from "./pages/saidas/StockExitList";

// Create a client for React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              
              {/* Product routes */}
              <Route path="/produtos/novo" element={<AppLayout><ProductNew /></AppLayout>} />
              <Route path="/produtos/consultar" element={<AppLayout><ProductList /></AppLayout>} />
              
              {/* Client routes */}
              <Route path="/clientes/novo" element={<AppLayout><ClientNew /></AppLayout>} />
              <Route path="/clientes/consultar" element={<AppLayout><ClientList /></AppLayout>} />
              
              {/* Supplier routes */}
              <Route path="/fornecedores/novo" element={<AppLayout><SupplierNew /></AppLayout>} />
              <Route path="/fornecedores/consultar" element={<AppLayout><SupplierList /></AppLayout>} />
              
              {/* Stock Entry routes */}
              <Route path="/entradas/nova" element={<AppLayout><StockEntryNew /></AppLayout>} />
              <Route path="/entradas/historico" element={<AppLayout><StockEntryList /></AppLayout>} />
              
              {/* Stock Exit routes */}
              <Route path="/saidas/nova" element={<AppLayout><StockExitNew /></AppLayout>} />
              <Route path="/saidas/historico" element={<AppLayout><StockExitList /></AppLayout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
