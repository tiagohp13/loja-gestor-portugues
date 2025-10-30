import React from "react";
import { useData } from "@/contexts/DataContext";
import { useProducts } from "@/contexts/ProductsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useClients } from "@/contexts/ClientsContext";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useStock } from "@/contexts/StockContext";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ui/ThemeToggle";
import DashboardCustomization from "@/components/ui/DashboardCustomization";
import UserProfileForm from "@/components/profile/UserProfileForm";
import AdminUserManagement from "@/components/profile/AdminUserManagement";
import { usePermissions } from "@/hooks/usePermissions";
import { ExportDataType } from "@/types";
import ClientTagSettings from "@/components/ui/ClientTagSettings";
import { useClientTags } from "@/hooks/useClientTags";

const Settings = () => {
  const { exportData } = useData();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { clients } = useClients();
  const { suppliers } = useSuppliers();
  const { orders } = useOrders();
  const { stockEntries, stockExits } = useStock();
  const { isAdmin, canEdit } = usePermissions();
  const { config: tagConfig, updateConfig: updateTagConfig } = useClientTags();

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
            expenses: "Despesas", // ✅ adicionado
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

  // Classe utilitária para fade suave nas tabs (sem ficheiros novos)
  const tabFade =
    "mt-4 space-y-4 transition-opacity duration-200 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100";

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Configurações" description="Gerencie as configurações do sistema" />

      <Tabs defaultValue="settings" className="mt-6">
        <TabsList
          className={`grid ${isAdmin ? (canEdit ? "grid-cols-4 w-[800px]" : "grid-cols-3 w-[600px]") : canEdit ? "grid-cols-3 w-[600px]" : "grid-cols-2 w-[400px]"}`}
        >
          <TabsTrigger value="settings">Sistema</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          {isAdmin && <TabsTrigger value="access">Configuração de Acessos</TabsTrigger>}
          {canEdit && <TabsTrigger value="data">Dados</TabsTrigger>}
        </TabsList>

        {/* DADOS */}
        <TabsContent value="data" className={tabFade}>
          {canEdit ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Exportar Dados</CardTitle>
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
                  <CardTitle>Importar Dados</CardTitle>
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
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  Apenas administradores e editores podem aceder a esta secção
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PERFIL */}
        <TabsContent value="profile" className={tabFade}>
          <UserProfileForm />
        </TabsContent>

        {/* ACESSOS */}
        <TabsContent value="access" className={tabFade}>
          {isAdmin ? (
            <AdminUserManagement />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  Apenas administradores podem aceder a esta secção
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SISTEMA */}
        <TabsContent value="settings" className={tabFade}>
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>Configurações gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Aparência</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-background">
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium">Tema da Interface</h5>
                      <p className="text-xs text-muted-foreground">
                        Escolha entre modo claro e escuro para maior conforto visual
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Personalização de Componentes</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure a aparência e a ordem dos elementos em todas as páginas do CRM
                </p>
                <DashboardCustomization />
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Etiquetas de Clientes</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure as regras para classificação automática de clientes
                </p>
                <ClientTagSettings config={tagConfig} onConfigChange={updateTagConfig} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
