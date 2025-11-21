import React from "react";
import { Navigate } from "react-router-dom";
import { useProductsQuery } from "@/hooks/queries/useProducts";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { useClientsQuery } from "@/hooks/queries/useClients";
import { useSuppliersQuery } from "@/hooks/queries/useSuppliers";
import { useOrdersQuery } from "@/hooks/queries/useOrders";
import { useStockEntriesQuery } from "@/hooks/queries/useStockEntries";
import { useStockExitsQuery } from "@/hooks/queries/useStockExits";
import { useExportData } from "@/hooks/useExportData";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { ExportDataType } from "@/types";
import { Download, Loader2 } from "lucide-react";
import { ImportButton } from "@/components/admin/ImportButton";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DataManagement = () => {
  const { exportData } = useExportData();
  const queryClient = useQueryClient();
  
  const { products, isLoading: isLoadingProducts, error: errorProducts } = useProductsQuery();
  const { categories, isLoading: isLoadingCategories, error: errorCategories } = useCategoriesQuery();
  const { clients, isLoading: isLoadingClients, error: errorClients } = useClientsQuery();
  const { suppliers, isLoading: isLoadingSuppliers, error: errorSuppliers } = useSuppliersQuery();
  const { orders, isLoading: isLoadingOrders, error: errorOrders } = useOrdersQuery();
  const { stockEntries, isLoading: isLoadingEntries, error: errorEntries } = useStockEntriesQuery();
  const { stockExits, isLoading: isLoadingExits, error: errorExits } = useStockExitsQuery();
  const { isAdmin } = usePermissions();

  const isLoading = isLoadingProducts || isLoadingCategories || isLoadingClients || 
                    isLoadingSuppliers || isLoadingOrders || isLoadingEntries || isLoadingExits;
  
  const hasError = errorProducts || errorCategories || errorClients || 
                   errorSuppliers || errorOrders || errorEntries || errorExits;

  // Additional security check - redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleImportSuccess = () => {
    // Invalidate all queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['stock-entries'] });
    queryClient.invalidateQueries({ queryKey: ['stock-exits'] });
  };

  const handleExport = (type: ExportDataType) => {
    console.log(`[AUDIT] User exported ${type} at ${new Date().toISOString()}`);
    exportData(type);
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <PageHeader 
        title="Gestão de Dados" 
        description="Exporte e importe dados do sistema"
      />

      {hasError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados. Por favor, recarregue a página.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>Exporte seus dados para backup ou transferência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleExport("products")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingProducts ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Produtos ({isLoadingProducts ? "..." : products.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("categories")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingCategories ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Categorias ({isLoadingCategories ? "..." : categories.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("clients")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingClients ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Clientes ({isLoadingClients ? "..." : clients.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("suppliers")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingSuppliers ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Fornecedores ({isLoadingSuppliers ? "..." : suppliers.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("orders")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingOrders ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Encomendas ({isLoadingOrders ? "..." : orders.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("stockEntries")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingEntries ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Entradas ({isLoadingEntries ? "..." : stockEntries.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("stockExits")}
                disabled={isLoading}
                className="w-full"
              >
                {isLoadingExits ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Saídas ({isLoadingExits ? "..." : stockExits.length})
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleExport("all")}
                disabled={isLoading}
                className="w-full md:col-span-2 lg:col-span-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Todos os Dados
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Importar Dados
            </CardTitle>
            <CardDescription>
              Importe dados de ficheiros JSON. Os dados serão validados antes da importação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> A importação irá adicionar novos registos. Dados duplicados podem ser criados.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <ImportButton 
                type="products" 
                label="Importar Produtos"
                onSuccess={handleImportSuccess}
              />
              
              <ImportButton 
                type="categories" 
                label="Importar Categorias"
                onSuccess={handleImportSuccess}
              />
              
              <ImportButton 
                type="clients" 
                label="Importar Clientes"
                onSuccess={handleImportSuccess}
              />
              
              <ImportButton 
                type="suppliers" 
                label="Importar Fornecedores"
                onSuccess={handleImportSuccess}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagement;
