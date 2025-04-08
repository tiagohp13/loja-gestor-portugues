
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, FileArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportDataType } from '@/types';

const Settings = () => {
  const { products, categories, clients, suppliers, orders, stockEntries, stockExits } = useData();
  const [exportTypes, setExportTypes] = useState<ExportDataType[]>([]);
  const [importType, setImportType] = useState<ExportDataType | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const handleExportData = () => {
    if (exportTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de dados para exportar");
      return;
    }

    const dataToExport: Record<string, any> = {};
    
    if (exportTypes.includes('products')) dataToExport.products = products;
    if (exportTypes.includes('categories')) dataToExport.categories = categories;
    if (exportTypes.includes('clients')) dataToExport.clients = clients;
    if (exportTypes.includes('suppliers')) dataToExport.suppliers = suppliers;
    if (exportTypes.includes('orders')) dataToExport.orders = orders;
    if (exportTypes.includes('stockEntries')) dataToExport.stockEntries = stockEntries;
    if (exportTypes.includes('stockExits')) dataToExport.stockExits = stockExits;
    
    // Export as CSV instead of JSON
    let csvContent = '';
    
    // Process each data type and create CSV content
    for (const type in dataToExport) {
      if (dataToExport[type].length > 0) {
        // Get headers from the first item
        const headers = Object.keys(dataToExport[type][0]);
        csvContent += `# ${type}\n`;
        csvContent += headers.join(',') + '\n';
        
        // Add data rows
        dataToExport[type].forEach((item: any) => {
          const row = headers.map(header => {
            const value = item[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
            return String(value).replace(/,/g, ';');
          });
          csvContent += row.join(',') + '\n';
        });
        
        csvContent += '\n'; // Add spacing between different data types
      }
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dados_exportados.csv');
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Dados exportados com sucesso");
  };

  const handleDownloadImportTemplate = () => {
    if (!importType) {
      toast.error("Selecione um tipo de dados para obter o modelo");
      return;
    }

    let headers: string[] = [];
    let templateData: any[] = [];
    let filename = '';

    switch (importType) {
      case 'products':
        headers = ['code', 'name', 'description', 'category', 'purchasePrice', 'salePrice', 'currentStock', 'minStock', 'status'];
        templateData = [
          {
            code: 'PROD001',
            name: 'Produto Exemplo',
            description: 'Descrição do produto',
            category: 'Categoria ID',
            purchasePrice: '10.50',
            salePrice: '19.99',
            currentStock: '50',
            minStock: '10',
            status: 'active'
          }
        ];
        filename = 'modelo_produtos.csv';
        break;

      case 'categories':
        headers = ['name', 'description', 'status'];
        templateData = [
          {
            name: 'Categoria Exemplo',
            description: 'Descrição da categoria',
            status: 'active'
          }
        ];
        filename = 'modelo_categorias.csv';
        break;

      case 'clients':
        headers = ['name', 'email', 'phone', 'address', 'taxId', 'notes', 'status'];
        templateData = [
          {
            name: 'Cliente Exemplo',
            email: 'cliente@exemplo.com',
            phone: '912345678',
            address: 'Rua Exemplo, 123',
            taxId: '123456789',
            notes: 'Notas sobre o cliente',
            status: 'active'
          }
        ];
        filename = 'modelo_clientes.csv';
        break;

      case 'suppliers':
        headers = ['name', 'email', 'phone', 'address', 'taxId', 'notes', 'status'];
        templateData = [
          {
            name: 'Fornecedor Exemplo',
            email: 'fornecedor@exemplo.com',
            phone: '912345678',
            address: 'Rua Exemplo, 123',
            taxId: '123456789',
            notes: 'Notas sobre o fornecedor',
            status: 'active'
          }
        ];
        filename = 'modelo_fornecedores.csv';
        break;

      default:
        toast.error("Tipo de modelo não suportado para importação");
        return;
    }

    const csvContent = [
      headers.join(','),
      ...templateData.map(item => headers.map(header => JSON.stringify(item[header] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.info("Ficheiro modelo para importação descarregado");
  };

  const toggleExportType = (type: ExportDataType) => {
    setExportTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Configurações" 
        description="Gerencie as configurações do sistema"
      />
      
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="import-export">Exportar/Importar</TabsTrigger>
            <TabsTrigger value="users" disabled>Utilizadores</TabsTrigger>
            <TabsTrigger value="advanced" disabled>Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Gerencie as configurações gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Esta secção será implementada em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import-export">
            <Tabs defaultValue="export">
              <TabsList className="mb-4">
                <TabsTrigger value="export">Exportar Dados</TabsTrigger>
                <TabsTrigger value="import">Importar Dados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle>Exportar Dados</CardTitle>
                    <CardDescription>
                      Selecione os tipos de dados que deseja exportar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-products"
                          checked={exportTypes.includes('products')}
                          onCheckedChange={() => toggleExportType('products')}
                        />
                        <Label htmlFor="export-products">Produtos</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-categories"
                          checked={exportTypes.includes('categories')}
                          onCheckedChange={() => toggleExportType('categories')}
                        />
                        <Label htmlFor="export-categories">Categorias</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-clients"
                          checked={exportTypes.includes('clients')}
                          onCheckedChange={() => toggleExportType('clients')}
                        />
                        <Label htmlFor="export-clients">Clientes</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-suppliers"
                          checked={exportTypes.includes('suppliers')}
                          onCheckedChange={() => toggleExportType('suppliers')}
                        />
                        <Label htmlFor="export-suppliers">Fornecedores</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-orders"
                          checked={exportTypes.includes('orders')}
                          onCheckedChange={() => toggleExportType('orders')}
                        />
                        <Label htmlFor="export-orders">Encomendas</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-stockEntries"
                          checked={exportTypes.includes('stockEntries')}
                          onCheckedChange={() => toggleExportType('stockEntries')}
                        />
                        <Label htmlFor="export-stockEntries">Entradas de Stock</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="export-stockExits"
                          checked={exportTypes.includes('stockExits')}
                          onCheckedChange={() => toggleExportType('stockExits')}
                        />
                        <Label htmlFor="export-stockExits">Saídas de Stock</Label>
                      </div>
                    </div>
                    
                    <Button onClick={handleExportData} className="w-full sm:w-auto">
                      <FileArrowDown className="w-4 h-4 mr-2" />
                      Exportar Dados Selecionados (CSV)
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="import">
                <Card>
                  <CardHeader>
                    <CardTitle>Importar Dados</CardTitle>
                    <CardDescription>
                      Selecione o tipo de dados que deseja importar e baixe o modelo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="import-products"
                            checked={importType === 'products'}
                            onCheckedChange={(checked) => setImportType(checked ? 'products' : null)}
                          />
                          <Label htmlFor="import-products">Produtos</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="import-categories"
                            checked={importType === 'categories'}
                            onCheckedChange={(checked) => setImportType(checked ? 'categories' : null)}
                          />
                          <Label htmlFor="import-categories">Categorias</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="import-clients"
                            checked={importType === 'clients'}
                            onCheckedChange={(checked) => setImportType(checked ? 'clients' : null)}
                          />
                          <Label htmlFor="import-clients">Clientes</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="import-suppliers"
                            checked={importType === 'suppliers'}
                            onCheckedChange={(checked) => setImportType(checked ? 'suppliers' : null)}
                          />
                          <Label htmlFor="import-suppliers">Fornecedores</Label>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleDownloadImportTemplate} variant="outline" className="w-full sm:w-auto">
                          <FileText className="w-4 h-4 mr-2" />
                          Baixar Modelo CSV
                        </Button>
                        
                        <Button className="w-full sm:w-auto" disabled>
                          <Upload className="w-4 h-4 mr-2" />
                          Importar Dados (Em breve)
                        </Button>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-md mt-4">
                        <p className="text-sm text-blue-800">
                          <strong>Nota:</strong> A importação de dados requer um arquivo CSV no formato correto. 
                          Baixe primeiro o modelo para se certificar de que está usando o formato adequado.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
