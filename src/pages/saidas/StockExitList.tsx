import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { StockExit } from "@/types";
import { useStock } from "@/contexts/StockContext";
import { mapDbStockExitToStockExit } from "@/utils/mappers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown, Plus, Package, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import { useSortableStockExits } from "@/hooks/useSortableStockExits";
import TableSkeleton from "@/components/ui/TableSkeleton";

type SortField = "date" | "number" | "client";

const StockExitList = () => {
  const navigate = useNavigate();
  const { deleteStockExit } = useStock();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { stockExits, isLoading } = useSortableStockExits();
  const [localExits, setLocalExits] = useState<StockExit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitToDelete, setExitToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Ensure all exits have the required fields
    const exitsWithTimestamps = stockExits.map((exit) => ({
      ...exit,
      updatedAt: exit.updatedAt || new Date().toISOString(),
      items: exit.items.map((item) => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      })),
    }));
    setLocalExits(exitsWithTimestamps);
  }, [stockExits]);

  const filteredExits = localExits.filter((exit) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      exit.number.toLowerCase().includes(searchLower) ||
      exit.clientName.toLowerCase().includes(searchLower) ||
      exit.invoiceNumber?.toLowerCase().includes(searchLower) ||
      exit.notes?.toLowerCase().includes(searchLower)
    );
  });

  const sortedExits = [...filteredExits].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case "number":
        aValue = a.number;
        bValue = b.number;
        break;
      case "client":
        aValue = a.clientName;
        bValue = b.clientName;
        break;
      default:
        aValue = a.date;
        bValue = b.date;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleViewExit = (id: string) => {
    navigate(`/saidas/${id}`);
  };

  const handleEditExit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!validatePermission(canEdit, "editar vendas")) return;
    navigate(`/saidas/editar/${id}`);
  };

  const confirmDeleteExit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!validatePermission(canDelete, "eliminar vendas")) return;
    setExitToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteExit = async () => {
    if (!exitToDelete) return;

    try {
      await deleteStockExit(exitToDelete);
      setLocalExits((prev) => prev.filter((exit) => exit.id !== exitToDelete));
      toast.success("Saída de stock eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting exit:", error);
      toast.error("Erro ao eliminar saída de stock");
    } finally {
      setDeleteDialogOpen(false);
      setExitToDelete(null);
    }
  };

  const calculateExitTotal = (exit: StockExit) => {
    return exit.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.salePrice;
      const discountAmount = itemTotal * ((item.discountPercent || 0) / 100);
      return total + (itemTotal - discountAmount);
    }, 0);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Histórico de Saídas" description="Consulte o histórico de saídas de stock" />
        <TableSkeleton title="A carregar saídas..." rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Histórico de Saídas" description="Consulte o histórico de saídas de stock" />

      {/* Header igual ao das despesas */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Total de saídas: {localExits.length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Pesquisar saídas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              if (!validatePermission(canCreate, "criar vendas")) return;
              navigate("/saidas/nova");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Saída
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSortChange("number")}>
                  Número
                  {sortField === "number" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline ml-1 h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSortChange("date")}>
                  Data
                  {sortField === "date" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline ml-1 h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSortChange("client")}>
                  Cliente
                  {sortField === "client" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline ml-1 h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma saída de stock encontrada
                  </TableCell>
                </TableRow>
              ) : (
                sortedExits.map((exit) => (
                  <TableRow
                    key={exit.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewExit(exit.id)}
                  >
                    <TableCell className="font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewExit(exit.id);
                        }}
                        className="text-sm font-medium text-gestorApp-blue hover:text-gestorApp-blue-dark underline"
                      >
                        {exit.number}
                      </button>
                    </TableCell>
                    <TableCell>{formatDate(exit.date)}</TableCell>
                    <TableCell>{exit.clientName}</TableCell>
                    <TableCell>{exit.invoiceNumber || "-"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(calculateExitTotal(exit))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewExit(exit.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <Button variant="ghost" size="icon" onClick={(e) => handleEditExit(e, exit.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={(e) => confirmDeleteExit(e, exit.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar esta saída de stock? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExit} disabled={isLoading}>
              {isLoading ? "A eliminar..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockExitList;
