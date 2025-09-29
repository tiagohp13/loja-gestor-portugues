import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Package, Users, ShoppingCart, TrendingUp, TrendingDown, Receipt, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/ui/PageHeader';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface DeletedRecord {
  id: string;
  name: string;
  table_type: string;
  deleted_at: string;
  additional_info: any;
}

interface GroupedRecords {
  [key: string]: DeletedRecord[];
}

const Reciclagem = () => {
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  useScrollToTop();

  const tableTypeLabels: { [key: string]: { label: string; icon: React.ComponentType<any> } } = {
    products: { label: 'Produtos', icon: Package },
    categories: { label: 'Categorias', icon: Building2 },
    clients: { label: 'Clientes', icon: Users },
    suppliers: { label: 'Fornecedores', icon: Building2 },
    orders: { label: 'Encomendas', icon: ShoppingCart },
    stock_entries: { label: 'Compras', icon: TrendingDown },
    stock_exits: { label: 'Vendas', icon: TrendingUp },
    expenses: { label: 'Despesas', icon: Receipt }
  };

  const fetchDeletedRecords = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_deleted_records');
      
      if (error) {
        console.error('Error fetching deleted records:', error);
        toast.error('Erro ao carregar registos apagados');
        return;
      }
      
      setDeletedRecords(data || []);
    } catch (error) {
      console.error('Error fetching deleted records:', error);
      toast.error('Erro ao carregar registos apagados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedRecords();
  }, []);

  const handleRestore = async (record: DeletedRecord) => {
    setIsRestoring(record.id);
    
    try {
      const { data, error } = await supabase.rpc('restore_record', {
        table_name: record.table_type,
        record_id: record.id
      });
      
      if (error) {
        console.error('Error restoring record:', error);
        toast.error('Erro ao restaurar registo');
        return;
      }
      
      toast.success(`${tableTypeLabels[record.table_type]?.label || 'Registo'} restaurado com sucesso`);
      await fetchDeletedRecords(); // Refresh the list
    } catch (error) {
      console.error('Error restoring record:', error);
      toast.error('Erro ao restaurar registo');
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async (record: DeletedRecord) => {
    setIsDeleting(record.id);
    
    try {
      const { data, error } = await supabase.rpc('permanent_delete_record', {
        table_name: record.table_type,
        record_id: record.id
      });
      
      if (error) {
        console.error('Error permanently deleting record:', error);
        toast.error('Erro ao eliminar permanentemente');
        return;
      }
      
      toast.success(`${tableTypeLabels[record.table_type]?.label || 'Registo'} eliminado permanentemente`);
      await fetchDeletedRecords(); // Refresh the list
    } catch (error) {
      console.error('Error permanently deleting record:', error);
      toast.error('Erro ao eliminar permanentemente');
    } finally {
      setIsDeleting(null);
    }
  };

  const groupedRecords: GroupedRecords = deletedRecords.reduce((acc, record) => {
    if (!acc[record.table_type]) {
      acc[record.table_type] = [];
    }
    acc[record.table_type].push(record);
    return acc;
  }, {} as GroupedRecords);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysInRecycleBin = (deletedAt: string) => {
    const now = new Date();
    const deletedDate = new Date(deletedAt);
    const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader title="Reciclagem" description="Gerir registos apagados e recuperação de dados" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gestorApp-blue mx-auto"></div>
            <p className="mt-2 text-gestorApp-gray">A carregar registos apagados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reciclagem" description="Gerir registos apagados e recuperação de dados" />

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gestorApp-blue">
              <Trash2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Total de registos na reciclagem: {deletedRecords.length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDeletedRecords}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {deletedRecords.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Trash2 className="w-16 h-16 text-gestorApp-gray mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gestorApp-gray-dark mb-2">
                Reciclagem vazia
              </h3>
              <p className="text-gestorApp-gray">
                Não há registos apagados para mostrar.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="all">Todos ({deletedRecords.length})</TabsTrigger>
            {Object.entries(tableTypeLabels).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key}>
                {label} ({groupedRecords[key]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {deletedRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                  isRestoring={isRestoring === record.id}
                  isDeleting={isDeleting === record.id}
                  tableTypeLabels={tableTypeLabels}
                  formatDate={formatDate}
                  getDaysInRecycleBin={getDaysInRecycleBin}
                />
              ))}
            </div>
          </TabsContent>

          {Object.keys(tableTypeLabels).map((tableType) => (
            <TabsContent key={tableType} value={tableType}>
              <div className="space-y-4">
                {(groupedRecords[tableType] || []).map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                    isRestoring={isRestoring === record.id}
                    isDeleting={isDeleting === record.id}
                    tableTypeLabels={tableTypeLabels}
                    formatDate={formatDate}
                    getDaysInRecycleBin={getDaysInRecycleBin}
                  />
                ))}
                {(!groupedRecords[tableType] || groupedRecords[tableType].length === 0) && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-4">
                        <p className="text-gestorApp-gray">
                          Nenhum registo de {tableTypeLabels[tableType]?.label.toLowerCase()} na reciclagem.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

interface RecordCardProps {
  record: DeletedRecord;
  onRestore: (record: DeletedRecord) => void;
  onPermanentDelete: (record: DeletedRecord) => void;
  isRestoring: boolean;
  isDeleting: boolean;
  tableTypeLabels: { [key: string]: { label: string; icon: React.ComponentType<any> } };
  formatDate: (date: string) => string;
  getDaysInRecycleBin: (deletedAt: string) => number;
}

const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onRestore,
  onPermanentDelete,
  isRestoring,
  isDeleting,
  tableTypeLabels,
  formatDate,
  getDaysInRecycleBin
}) => {
  const IconComponent = tableTypeLabels[record.table_type]?.icon || Package;
  const daysInBin = getDaysInRecycleBin(record.deleted_at);
  
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="w-5 h-5 text-gestorApp-blue" />
            <div>
              <CardTitle className="text-base">{record.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {tableTypeLabels[record.table_type]?.label || record.table_type}
                </Badge>
                <Badge variant={daysInBin > 25 ? "destructive" : daysInBin > 20 ? "secondary" : "outline"}>
                  {daysInBin} {daysInBin === 1 ? 'dia' : 'dias'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(record)}
              disabled={isRestoring || isDeleting}
            >
              {isRestoring ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Restaurar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isRestoring || isDeleting}
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar Permanentemente</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem a certeza que pretende eliminar permanentemente "{record.name}"? 
                    Esta ação não pode ser desfeita e os dados serão perdidos para sempre.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onPermanentDelete(record)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gestorApp-gray">Apagado em:</span>
            <p className="font-medium">{formatDate(record.deleted_at)}</p>
          </div>
          
          {record.additional_info && Object.keys(record.additional_info).length > 0 && (
            <div>
              <span className="text-gestorApp-gray">Detalhes:</span>
              <div className="mt-1">
                {Object.entries(record.additional_info).slice(0, 2).map(([key, value]) => (
                  <p key={key} className="text-xs text-gestorApp-gray-dark">
                    {key}: {String(value)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {daysInBin > 25 && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
            ⚠️ Este registo será eliminado automaticamente em {30 - daysInBin} {30 - daysInBin === 1 ? 'dia' : 'dias'}.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Reciclagem;