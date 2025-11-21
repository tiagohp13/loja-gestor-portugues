import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { StockExit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, ArrowUp, ArrowDown, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermissions } from "@/hooks/usePermissions";
import { usePaginatedStockExits } from "@/hooks/queries/usePaginatedStockExits";
import { useSortableTable } from "@/hooks/useSortableTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import StockExitTotalCard from "./components/StockExitTotalCard";

export default function StockExitList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitToDelete, setExitToDelete] = useState<StockExit | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    stockExits: rawStockExits,
    totalCount,
    totalPages,
    isLoading,
    deleteStockExit,
  } = usePaginatedStockExits(currentPage);

  const { sortState, handleSort: handleSortChange, getSortIcon } = useSortableTable({
    column: "date",
    direction: "desc"
  });

  const filteredAndSortedExits = useMemo(() => {
    let exits = [...rawStockExits];

    // Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      exits = exits.filter((exit) =>
        exit.number.toLowerCase().includes(searchLower) ||
        exit.clientName.toLowerCase().includes(searchLower) ||
        (exit.invoiceNumber && exit.invoiceNumber.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    if (sortState.column && sortState.direction) {
      exits.sort((a, b) => {
        const aValue = a[sortState.column as keyof StockExit];
        const bValue = b[sortState.column as keyof StockExit];

        if (aValue === undefined || bValue === undefined) return 0;

        if (sortState.direction === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return exits;
  }, [rawStockExits, searchTerm, sortState]);

  const handleViewExit = (id: string) => {
    navigate(`/saidas/${id}`);
  };

  const handleEditExit = (id: string) => {
    navigate(`/saidas/editar/${id}`);
  };

  const confirmDeleteExit = (exit: StockExit) => {
    setExitToDelete(exit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteExit = () => {
    if (exitToDelete) {
      deleteStockExit(exitToDelete.id);
      setDeleteDialogOpen(false);
      setExitToDelete(null);
      // Reset to first page after delete
      setCurrentPage(0);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateExitTotal = (exit: StockExit) => {
    const itemsTotal = exit.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.salePrice;
      const discountAmount = itemTotal * ((item.discountPercent || 0) / 100);
      return total + (itemTotal - discountAmount);
    }, 0);

    const discount = exit.discount || 0;
    return itemsTotal * (1 - discount / 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <PageHeader 
        title="Vendas" 
        description="Gerir saídas de stock e vendas"
      />

      <StockExitTotalCard totalCount={totalCount} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Procurar vendas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
            {canCreate && (
              <Button onClick={() => navigate("/saidas/nova")}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Venda
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSortChange("number")}
                    >
                      <div className="flex items-center gap-1">
                        Número
                        {getSortIcon("number") === "asc" && <ArrowUp className="h-4 w-4" />}
                        {getSortIcon("number") === "desc" && <ArrowDown className="h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSortChange("date")}
                    >
                      <div className="flex items-center gap-1">
                        Data
                        {getSortIcon("date") === "asc" && <ArrowUp className="h-4 w-4" />}
                        {getSortIcon("date") === "desc" && <ArrowDown className="h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSortChange("invoiceNumber")}
                    >
                      <div className="flex items-center gap-1">
                        Fatura
                        {getSortIcon("invoiceNumber") === "asc" && <ArrowUp className="h-4 w-4" />}
                        {getSortIcon("invoiceNumber") === "desc" && <ArrowDown className="h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedExits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm ? "Nenhuma venda encontrada" : "Nenhuma venda registada"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedExits.map((exit) => (
                      <TableRow 
                        key={exit.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewExit(exit.id)}
                      >
                        <TableCell className="font-medium text-gestorApp-blue">{exit.number}</TableCell>
                        <TableCell>{formatDate(exit.date)}</TableCell>
                        <TableCell>{exit.clientName}</TableCell>
                        <TableCell>{exit.invoiceNumber || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateExitTotal(exit))}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewExit(exit.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditExit(exit.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDeleteExit(exit)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage + 1} de {totalPages} ({totalCount} {totalCount === 1 ? 'venda' : 'vendas'})
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar esta venda? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExit}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
