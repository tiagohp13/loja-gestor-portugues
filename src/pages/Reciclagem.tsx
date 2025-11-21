import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RefreshCw, Trash2, Package, Users, ShoppingCart, TrendingUp, TrendingDown, Receipt, Building2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { formatDateTime } from '@/utils/formatting';
import { usePermissions } from '@/hooks/usePermissions';
import { useDeletedRecords, useRestoreRecord, usePermanentDeleteRecord, DeletedRecord } from '@/hooks/queries/useDeletedRecords';
import DeletedRecordModal from './Reciclagem/components/DeletedRecordModal';
interface GroupedRecords {
  [key: string]: DeletedRecord[];
}
const Reciclagem = () => {
  const { isAdmin } = usePermissions();
  const { data: deletedRecords = [], isLoading, refetch } = useDeletedRecords();
  const restoreMutation = useRestoreRecord();
  const deleteMutation = usePermanentDeleteRecord();
  
  const [selectedRecord, setSelectedRecord] = useState<{
    id: string;
    type: string;
    number: string;
  } | null>(null);
  
  useScrollToTop();
  const tableTypeLabels: {
    [key: string]: {
      label: string;
      icon: React.ComponentType<any>;
    };
  } = {
    products: {
      label: 'Produtos',
      icon: Package
    },
    categories: {
      label: 'Categorias',
      icon: Building2
    },
    clients: {
      label: 'Clientes',
      icon: Users
    },
    suppliers: {
      label: 'Fornecedores',
      icon: Building2
    },
    orders: {
      label: 'Encomendas',
      icon: ShoppingCart
    },
    stock_entries: {
      label: 'Compras',
      icon: TrendingDown
    },
    stock_exits: {
      label: 'Vendas',
      icon: TrendingUp
    },
    expenses: {
      label: 'Despesas',
      icon: Receipt
    }
  };
  const handleRestore = (record: DeletedRecord) => {
    if (!isAdmin) {
      return;
    }
    restoreMutation.mutate({
      tableType: record.table_type,
      recordId: record.id
    });
  };
  
  const handlePermanentDelete = (record: DeletedRecord) => {
    if (!isAdmin) {
      return;
    }
    deleteMutation.mutate({
      tableType: record.table_type,
      recordId: record.id
    });
  };
  const groupedRecords: GroupedRecords = deletedRecords.reduce((acc, record) => {
    if (!acc[record.table_type]) {
      acc[record.table_type] = [];
    }
    acc[record.table_type].push(record);
    return acc;
  }, {} as GroupedRecords);
  const getDaysInRecycleBin = (deletedAt: string) => {
    const now = new Date();
    const deletedDate = new Date(deletedAt);
    const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const getPermanentDeletionDate = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    deletedDate.setDate(deletedDate.getDate() + 30);
    return formatDateTime(deletedDate);
  };
  const handleOpenRecordModal = (recordId: string, tableType: string, recordNumber: string) => {
    setSelectedRecord({
      id: recordId,
      type: tableType,
      number: recordNumber
    });
  };
  const handleCloseRecordModal = () => {
    setSelectedRecord(null);
  };
  if (isLoading) {
    return <div className="p-6">
        <PageHeader title="Reciclagem" description="Gerir registos apagados e recuperação de dados" />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gestorApp-blue mx-auto"></div>
            <p className="mt-2 text-gestorApp-gray">A carregar registos apagados...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="p-6 space-y-6">
      <PageHeader title="Reciclagem" description="Gerir registos apagados e recuperação de dados" />

      {selectedRecord && <DeletedRecordModal isOpen={!!selectedRecord} onClose={handleCloseRecordModal} recordId={selectedRecord.id} recordType={selectedRecord.type} recordNumber={selectedRecord.number} />}

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
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {deletedRecords.length === 0 ? <Card>
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
        </Card> : <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="all">Todos ({deletedRecords.length})</TabsTrigger>
            {Object.entries(tableTypeLabels).map(([key, {
          label
        }]) => <TabsTrigger key={key} value={key}>
                {label} ({groupedRecords[key]?.length || 0})
              </TabsTrigger>)}
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {deletedRecords.map(record => <RecordCard key={record.id} record={record} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} isRestoring={restoreMutation.isPending} isDeleting={deleteMutation.isPending} isAdmin={isAdmin} tableTypeLabels={tableTypeLabels} getDaysInRecycleBin={getDaysInRecycleBin} getPermanentDeletionDate={getPermanentDeletionDate} onOpenModal={handleOpenRecordModal} />)}
            </div>
          </TabsContent>

          {Object.keys(tableTypeLabels).map(tableType => <TabsContent key={tableType} value={tableType}>
              <div className="space-y-4">
                {(groupedRecords[tableType] || []).map(record => <RecordCard key={record.id} record={record} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} isRestoring={restoreMutation.isPending} isDeleting={deleteMutation.isPending} isAdmin={isAdmin} tableTypeLabels={tableTypeLabels} getDaysInRecycleBin={getDaysInRecycleBin} getPermanentDeletionDate={getPermanentDeletionDate} onOpenModal={handleOpenRecordModal} />)}
                {(!groupedRecords[tableType] || groupedRecords[tableType].length === 0) && <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-4">
                        <p className="text-gestorApp-gray">
                          Nenhum registo de {tableTypeLabels[tableType]?.label.toLowerCase()} na reciclagem.
                        </p>
                      </div>
                    </CardContent>
                  </Card>}
              </div>
            </TabsContent>)}
        </Tabs>}
    </div>;
};
interface RecordCardProps {
  record: DeletedRecord;
  onRestore: (record: DeletedRecord) => void;
  onPermanentDelete: (record: DeletedRecord) => void;
  isRestoring: boolean;
  isDeleting: boolean;
  isAdmin: boolean;
  tableTypeLabels: {
    [key: string]: {
      label: string;
      icon: React.ComponentType<any>;
    };
  };
  getDaysInRecycleBin: (deletedAt: string) => number;
  getPermanentDeletionDate: (deletedAt: string) => string;
  onOpenModal: (recordId: string, tableType: string, recordNumber: string) => void;
}
const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onRestore,
  onPermanentDelete,
  isRestoring,
  isDeleting,
  isAdmin,
  tableTypeLabels,
  getDaysInRecycleBin,
  getPermanentDeletionDate,
  onOpenModal
}) => {
  const IconComponent = tableTypeLabels[record.table_type]?.icon || Package;
  const daysInBin = getDaysInRecycleBin(record.deleted_at);
  const permanentDeletionDate = getPermanentDeletionDate(record.deleted_at);

  // Extrair o número do registo do additional_info
  const recordNumber = record.additional_info?.number || null;
  const handleNumberClick = () => {
    if (recordNumber) {
      onOpenModal(record.id, record.table_type, recordNumber);
    }
  };
  return <Card className="relative hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
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
                  {daysInBin} {daysInBin === 1 ? 'dia' : 'dias'} na reciclagem
                </Badge>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onRestore(record)} disabled={isRestoring || isDeleting}>
                {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Restaurar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isRestoring || isDeleting}>
                    {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                    <AlertDialogAction onClick={() => onPermanentDelete(record)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Eliminar Permanentemente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-slate-950">Apagado em</span>
            <p className="text-sm font-normal">{formatDateTime(record.deleted_at)}</p>
          </div>
          
          {recordNumber && <div className="space-y-1">
              <span className="text-sm font-semibold text-slate-950">Número: </span>
              <button onClick={handleNumberClick} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                {recordNumber}
              </button>
            </div>}
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm text-[#c41e1e] font-extrabold">
            <span className="font-normal">Será eliminado definitivamente em:</span> {permanentDeletionDate}
          </p>
        </div>
        
        {daysInBin > 25 && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-medium">
            ⚠️ Este registo será eliminado automaticamente em {30 - daysInBin} {30 - daysInBin === 1 ? 'dia' : 'dias'}.
          </div>}
      </CardContent>
    </Card>;
};
export default Reciclagem;