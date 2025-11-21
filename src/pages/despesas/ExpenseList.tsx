import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Edit, Trash2, Receipt } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { checkExpenseDependencies } from '@/utils/dependencyUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';
import { usePaginatedExpenses } from '@/hooks/queries/usePaginatedExpenses';
import TableSkeleton from '@/components/ui/TableSkeleton';

const ExpenseList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    expenseId: string | null;
  }>({ open: false, expenseId: null });

  const {
    expenses: rawExpenses,
    totalCount,
    totalPages,
    isLoading,
    deleteExpense,
  } = usePaginatedExpenses(currentPage);

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return rawExpenses;
    
    const searchLower = searchTerm.toLowerCase();
    return rawExpenses.filter(expense =>
      expense.number.toLowerCase().includes(searchLower) ||
      expense.supplierName.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, rawExpenses]);

  const handleDeleteExpense = () => {
    if (!deleteDialog.expenseId) return;
    
    if (!validatePermission(canDelete, 'eliminar despesas')) {
      setDeleteDialog({ open: false, expenseId: null });
      return;
    }

    deleteExpense(deleteDialog.expenseId);
    setDeleteDialog({ open: false, expenseId: null });
    setCurrentPage(0); // Reset to first page after delete
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PageHeader title="Histórico de Despesas" description="Consulte e gerencie as suas despesas" />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Histórico de Despesas" description="Consulte e gerencie as suas despesas" />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <Receipt className="w-5 h-5" />
            <span className="text-sm font-medium">Total de despesas: {totalCount}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
          <Input
            placeholder="Pesquisar despesas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0); // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        {canCreate && (
          <Button onClick={() => {
            if (!validatePermission(canCreate, 'criar despesas')) return;
            navigate('/despesas/nova');
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="p-6">
              <EmptyState 
                title="Nenhuma despesa encontrada"
                description={searchTerm ? "Tente ajustar os filtros de pesquisa." : "Comece por adicionar uma nova despesa."}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">NÚMERO</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">DATA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">FORNECEDOR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">TOTAL</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/despesas/${expense.id}`)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/despesas/${expense.id}`);
                            }}
                            className="text-sm font-medium text-gestorApp-blue hover:text-gestorApp-blue-dark underline"
                          >
                            {expense.number}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{formatDate(expense.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{expense.supplierName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">{formatCurrency(expense.total || 0)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!validatePermission(canEdit, 'editar despesas')) return;
                                  navigate(`/despesas/editar/${expense.id}`);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialog({ open: true, expenseId: expense.id });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage + 1} de {totalPages} ({totalCount} {totalCount === 1 ? 'despesa' : 'despesas'})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Seguinte
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, expenseId: null })}
        onDelete={handleDeleteExpense}
        checkDependencies={deleteDialog.expenseId ? () => checkExpenseDependencies(deleteDialog.expenseId!) : undefined}
        title="Eliminar Despesa"
        description="Tem a certeza que pretende eliminar esta despesa? Esta ação não pode ser desfeita."
        trigger={<div />}
      />
    </div>
  );
};

export default ExpenseList;
