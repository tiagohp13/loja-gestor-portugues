import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';
import { useClientTags } from '@/hooks/useClientTags';
import { useClientsQuery } from '@/hooks/queries/useClients';
import { useStockExitsQuery } from '@/hooks/queries/useStockExits';
import { calculateClientTag, getTagColor } from '@/utils/clientTags';
import { Tags, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

interface TagRuleConfig {
  inactivityMonths: number;
  vipThreshold: number;
  vipPeriodMonths: number;
  riskMonths: number;
  seasonalMinPurchases: number;
}

const DEFAULT_CONFIG: TagRuleConfig = {
  inactivityMonths: 3,
  vipThreshold: 500,
  vipPeriodMonths: 6,
  riskMonths: 4,
  seasonalMinPurchases: 3,
};

const ClientTagsManagement: React.FC = () => {
  const { isAdmin } = usePermissions();
  const { config: savedConfig, updateConfig } = useClientTags();
  const { clients } = useClientsQuery();
  const { stockExits } = useStockExitsQuery();

  const [localConfig, setLocalConfig] = useState<TagRuleConfig>({
    ...DEFAULT_CONFIG,
    inactivityMonths: savedConfig.inactivityMonths,
  });

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Calculate tag distribution
  const tagStats = useMemo(() => {
    const stats = {
      Novo: 0,
      Recorrente: 0,
      Inativo: 0,
      VIP: 0,
    };

    clients.forEach(client => {
      const tag = calculateClientTag(client, stockExits, {
        inactivityMonths: localConfig.inactivityMonths,
      });
      stats[tag]++;
    });

    return stats;
  }, [clients, stockExits, localConfig.inactivityMonths]);

  // Prepare chart data
  const chartData = [
    { name: 'Novo', value: tagStats.Novo, color: '#3B82F6' },
    { name: 'Recorrente', value: tagStats.Recorrente, color: '#10B981' },
    { name: 'Inativo', value: tagStats.Inativo, color: '#6B7280' },
    { name: 'VIP', value: tagStats.VIP, color: '#F59E0B' },
  ];

  const barChartData = chartData.map(item => ({
    name: item.name,
    Clientes: item.value,
    fill: item.color,
  }));

  const handleSave = () => {
    if (localConfig.inactivityMonths < 1) {
      toast.error('O período de inatividade deve ser pelo menos 1 mês');
      return;
    }

    if (localConfig.vipThreshold < 0) {
      toast.error('O valor mínimo VIP deve ser positivo');
      return;
    }

    updateConfig({
      inactivityMonths: localConfig.inactivityMonths,
    });

    toast.success('Configurações das etiquetas atualizadas com sucesso');
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
    toast.info('Configurações restauradas para os valores padrão');
  };

  const totalClients = clients.length;
  const activeClientsPercent = totalClients > 0 
    ? ((tagStats.Recorrente + tagStats.VIP) / totalClients * 100).toFixed(1)
    : 0;

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <PageHeader 
        title="Gestão de Etiquetas de Clientes" 
        description="Configure as regras automáticas de classificação de clientes"
      />

      <div className="mt-6 space-y-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeClientsPercent}% ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Novo</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tagStats.Novo}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalClients > 0 ? ((tagStats.Novo / totalClients) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">Recorrente</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tagStats.Recorrente}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalClients > 0 ? ((tagStats.Recorrente / totalClients) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">VIP</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tagStats.VIP}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalClients > 0 ? ((tagStats.VIP / totalClients) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Etiquetas</CardTitle>
              <CardDescription>Visualização da classificação dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Clientes" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proporção de Clientes</CardTitle>
              <CardDescription>Percentagem por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5" />
              Configuração de Regras
            </CardTitle>
            <CardDescription>
              Personalize os critérios para classificação automática de clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Novo */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Novo</Badge>
                  Cliente Novo
                </h4>
                <p className="text-sm text-muted-foreground">
                  Clientes com apenas 1 compra registada
                </p>
              </div>
              <div className="pl-4 border-l-2 border-blue-200">
                <p className="text-sm text-muted-foreground">
                  Atualmente: <strong>{tagStats.Novo} clientes</strong> seriam marcados como Novo
                </p>
              </div>
            </div>

            <Separator />

            {/* Recorrente */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">Recorrente</Badge>
                  Cliente Recorrente
                </h4>
                <p className="text-sm text-muted-foreground">
                  Clientes com mais de 1 compra registada e ativos
                </p>
              </div>
              <div className="pl-4 border-l-2 border-green-200">
                <p className="text-sm text-muted-foreground">
                  Atualmente: <strong>{tagStats.Recorrente} clientes</strong> seriam marcados como Recorrente
                </p>
              </div>
            </div>

            <Separator />

            {/* VIP */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">VIP</Badge>
                  Cliente VIP
                </h4>
                <p className="text-sm text-muted-foreground">
                  Clientes com 3 ou mais compras nos últimos 3 meses
                </p>
              </div>
              <div className="pl-4 border-l-2 border-amber-200 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="vip-threshold">
                    Valor Mínimo de Compras (€)
                  </Label>
                  <Input
                    id="vip-threshold"
                    type="number"
                    min="0"
                    step="50"
                    value={localConfig.vipThreshold}
                    onChange={(e) => setLocalConfig({ 
                      ...localConfig, 
                      vipThreshold: Number(e.target.value) 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vip-period">
                    Período de Avaliação (meses)
                  </Label>
                  <Input
                    id="vip-period"
                    type="number"
                    min="1"
                    max="12"
                    value={localConfig.vipPeriodMonths}
                    onChange={(e) => setLocalConfig({ 
                      ...localConfig, 
                      vipPeriodMonths: Number(e.target.value) 
                    })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Atualmente: <strong>{tagStats.VIP} clientes</strong> seriam marcados como VIP
                </p>
              </div>
            </div>

            <Separator />

            {/* Inativo */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inativo</Badge>
                  Cliente Inativo
                </h4>
                <p className="text-sm text-muted-foreground">
                  Clientes sem compras há mais de X meses
                </p>
              </div>
              <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="inactivity-months">
                    Período de Inatividade (meses)
                  </Label>
                  <Input
                    id="inactivity-months"
                    type="number"
                    min="1"
                    max="24"
                    value={localConfig.inactivityMonths}
                    onChange={(e) => setLocalConfig({ 
                      ...localConfig, 
                      inactivityMonths: Number(e.target.value) 
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Clientes sem compras há <strong>{localConfig.inactivityMonths} meses</strong> serão marcados como Inativos
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Atualmente: <strong>{tagStats.Inativo} clientes</strong> seriam marcados como Inativo
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                Guardar Configurações
              </Button>
              <Button onClick={handleReset} variant="outline">
                Restaurar Padrão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alert about inactive clients */}
        {tagStats.Inativo > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Atenção: Clientes Inativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800">
                Existem <strong>{tagStats.Inativo} clientes inativos</strong> ({((tagStats.Inativo / totalClients) * 100).toFixed(1)}% do total).
                Considere criar campanhas de reativação para recuperar estes clientes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientTagsManagement;
