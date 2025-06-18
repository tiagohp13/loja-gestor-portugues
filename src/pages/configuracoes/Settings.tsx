import React from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/ui/ThemeToggle';
import DashboardCustomization from '@/components/ui/DashboardCustomization';
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
      
      {/* Swap the order of tabs: Sistema first, Dados second */}
      <Tabs defaultValue="data" className="mt-6">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="settings">Sistema</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data" className="space-y-4 mt-4">
          {/* ... existing content for Dados tab ... */}
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          {/* ... existing content for Sistema tab ... */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
