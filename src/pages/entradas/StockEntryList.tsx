import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import StockEntrySearch from "./components/StockEntrySearch";
import StockEntryTable from "./components/StockEntryTable";
import { useStockEntries } from "./hooks/useStockEntries";
import { StockEntrySortField } from "./hooks/stockEntryForm/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Search } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import TableSkeleton from "@/components/ui/TableSkeleton";

const StockEntryList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    isLoading,
    sortedEntries,
    handleSortChange,
    handleDeleteEntry,
    calculateEntryTotal,
    localEntries,
  } = useStockEntries();

  const handleViewEntry = (id: string) => {
    navigate(`/entradas/${id}`);
  };

  const handleEditEntry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!validatePermission(canEdit, "editar compras")) return;
    navigate(`/entradas/editar/${id}`);
  };

  const handleDeleteEntryWithPermission = (id: string) => {
    if (!validatePermission(canDelete, "eliminar compras")) return;
    handleDeleteEntry(id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Histórico de Compras" description="Consulte o histórico de compras de stock" />
        <TableSkeleton title="A carregar compras..." rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Histórico de Compras" description="Consulte o histórico de compras de stock" />

      {/* Header igual ao das despesas e saídas */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Total de compras: {localEntries.length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Pesquisar compras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray w-4 h-4" />
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              if (!validatePermission(canCreate, "criar compras")) return;
              navigate("/entradas/nova");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Compra
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <StockEntryTable
          entries={sortedEntries}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onViewEntry={handleViewEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntryWithPermission}
          calculateEntryTotal={calculateEntryTotal}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  );
};

export default StockEntryList;
