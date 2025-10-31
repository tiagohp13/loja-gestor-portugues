import React from "react";
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
import { Database, Download, Upload } from "lucide-react";

const DataManagement = () => {
  const { exportData } = useExportData();
  const { products } = useProductsQuery();
  const { categories } = useCategoriesQuery();
  const { clients } = useClientsQuery();
  const { suppliers } = useSuppliersQuery();
  const { orders } = useOrdersQuery();
  const { stockEntries } = useStockEntriesQuery();
  const { stockExits } = useStockExitsQuery();
  const { isAdmin } = usePermissions();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, type: ExportDataType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = (event.target?.result as string) ?? "";

      // --- Pré-visualização simples (sem criar componentes novos) ---
      // Tenta perceber quantos registos existem e mostra um confirm()
      let summary = "";
      let okToProceed = true;

      try {
        const json = JSON.parse(content);

        const countArray = (arr: unknown) => (Array.isArray(arr) ? arr.length : 0);

        if (type === "all") {
          // Espera-se um objeto com várias coleções
          const counts: Record<string, number> = {
            products: countArray(json?.products),
            categories: countArray(json?.categories),
            clients: countArray(json?.clients),
            suppliers: countArray(json?.suppliers),
            orders: countArray(json?.orders),
            stockEntries: countArray(json?.stockEntries),
            stockExits: countArray(json?.stockExits),
          };

          const total =
            counts.products +
            counts.categories +
            counts.clients +
            counts.suppliers +
            counts.orders +
            counts.stockEntries +
            counts.stockExits;

          summary =
            `Será importado o conjunto completo:\n` +
            `• Produtos: ${counts.products}\n` +
            `• Categorias: ${counts.categories}\n` +
            `• Clientes: ${counts.clients}\n` +
            `• Fornecedores: ${counts.suppliers}\n` +
            `• Encomendas: ${counts.orders}\n` +
            `• Entradas: ${counts.stockEntries}\n` +
            `• Saídas: ${counts.stockExits}\n` +
            `Total de registos: ${total}\n\n` +
            `Continuar com a importação?`;
        } else {
          // Cada tipo individual normalmente é um array
          const total = countArray(json);
          const labelMap: Record<ExportDataType, string> = {
            products: "Produtos",
            categories: "Categorias",
            clients: "Clientes",
            suppliers: "Fornecedores",
            orders: "Encomendas",
            stockEntries: "Entradas de Stock",
            stockExits: "Saídas de Stock",
            expenses: "Despesas",
            all: "Todos os Dados",
          };

          summary =
            `Ficheiro detetado: ${labelMap[type]}.\n` +
            `Registos identificados: ${total}\n\n` +
            `Continuar com a importação?`;
        }

        okToProceed = window.confirm(summary);
      } catch {
        // Se não for JSON válido, pergunta mesmo assim
        okToProceed = window.confirm(
          "O ficheiro não parece ser um JSON válido.\n" + "Queres tentar importá-lo na mesma?",
        );
      }

      if (!okToProceed) return;

      // Import efetivo - temporarily disabled during context refactor
      // TODO: Re-implement importData in the appropriate context
      /*
      if (content) {
        await importData(type, content);
      }
      */
      console.warn('Import functionality temporarily disabled during context migration');

      // Limpar o input para poderes importar o mesmo ficheiro novamente se quiseres
      e.currentTarget.value = "";
    };

    reader.readAsText(file);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Gestão de Dados" 
          description="Acesso restrito a administradores"
        />
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center text-muted-foreground">
              Apenas administradores podem aceder a esta secção
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Gestão de Dados" 
        description="Exporte e importe dados do sistema"
      />

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>Exporte seus dados para backup ou transferência</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => exportData("products")}>
                Exportar Produtos ({products.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("categories")}>
                Exportar Categorias ({categories.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("clients")}>
                Exportar Clientes ({clients.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("suppliers")}>
                Exportar Fornecedores ({suppliers.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("orders")}>
                Exportar Encomendas ({orders.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("stockEntries")}>
                Exportar Entradas ({stockEntries.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("stockExits")}>
                Exportar Saídas ({stockExits.length})
              </Button>
              <Button variant="outline" onClick={() => exportData("all" as ExportDataType)}>
                Exportar Todos os Dados
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Dados
            </CardTitle>
            <CardDescription>Importe seus dados de arquivo JSON</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  htmlFor="import-products"
                  className="cursor-pointer block w-full px-4 py-2 text-center border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Importar Produtos
                </label>
                <input
                  id="import-products"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImport(e, "products")}
                  className="hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="import-categories"
                  className="cursor-pointer block w-full px-4 py-2 text-center border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Importar Categorias
                </label>
                <input
                  id="import-categories"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImport(e, "categories")}
                  className="hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="import-clients"
                  className="cursor-pointer block w-full px-4 py-2 text-center border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Importar Clientes
                </label>
                <input
                  id="import-clients"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImport(e, "clients")}
                  className="hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="import-suppliers"
                  className="cursor-pointer block w-full px-4 py-2 text-center border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Importar Fornecedores
                </label>
                <input
                  id="import-suppliers"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImport(e, "suppliers")}
                  className="hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="import-all"
                  className="cursor-pointer block w-full px-4 py-2 text-center border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  Importar Todos os Dados
                </label>
                <input
                  id="import-all"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleImport(e, "all")}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagement;
