import React from "react";
import UserProfileForm from "@/components/profile/UserProfileForm";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ui/ThemeToggle";
import DashboardCustomization from "@/components/ui/DashboardCustomization";

const Settings = () => {
  // Classe utilitária para fade suave nas tabs (sem ficheiros novos)
  const tabFade =
    "mt-4 space-y-4 transition-opacity duration-200 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100";

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Configurações" description="Gerencie as configurações do sistema" />

      <Tabs defaultValue="settings" className="mt-6">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="settings">Sistema</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        {/* PERFIL */}
        <TabsContent value="profile" className={tabFade}>
          <UserProfileForm />
        </TabsContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
