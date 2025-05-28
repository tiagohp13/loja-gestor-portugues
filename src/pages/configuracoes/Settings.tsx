
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, User, Database, Bell } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Settings = () => {
  useScrollToTop();

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Configurações" 
        description="Gerir as configurações do sistema" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Utilizador
            </CardTitle>
            <CardDescription>
              Gerir informações da conta e preferências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Editar Perfil</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados do Sistema
            </CardTitle>
            <CardDescription>
              Backup e restauro de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">Exportar Dados</Button>
              <Button variant="outline" className="w-full">Importar Dados</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configurar alertas e notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Configurar Alertas</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Configurações Avançadas</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
