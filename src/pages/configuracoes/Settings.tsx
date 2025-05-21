
import React from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportDataType } from '@/types';

const Settings = () => {
  const { 
    products, categories, clients, suppliers, orders, stockEntries, stockExits, 
    exportData, importData, updateData
  } = useData();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, type: ExportDataType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importData(type, content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Configurações" 
        description="Gerencie as configurações do sistema"
      />
      
      <Tabs defaultValue="data" className="mt-6">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="settings">Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>
                Exporte seus dados para backup ou transferência
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => exportData('products')}>
                  Exportar Produtos ({products.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('categories')}>
                  Exportar Categorias ({categories.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('clients')}>
                  Exportar Clientes ({clients.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('suppliers')}>
                  Exportar Fornecedores ({suppliers.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('orders')}>
                  Exportar Encomendas ({orders.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('stockEntries')}>
                  Exportar Entradas ({stockEntries.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('stockExits')}>
                  Exportar Saídas ({stockExits.length})
                </Button>
                <Button variant="outline" onClick={() => exportData('all' as ExportDataType)}>
                  Exportar Todos os Dados
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Importar Dados</CardTitle>
              <CardDescription>
                Importe seus dados de arquivo JSON
              </CardDescription>
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
                    onChange={(e) => handleImport(e, 'products')}
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
                    onChange={(e) => handleImport(e, 'categories')}
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
                    onChange={(e) => handleImport(e, 'clients')}
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
                    onChange={(e) => handleImport(e, 'suppliers')}
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
                    onChange={(e) => handleImport(e, 'all')}
                    className="hidden" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Em breve...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
