import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import StockEntryTable from "./components/StockEntryTable";
import { useStockEntries } from "./hooks/useStockEntries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Search } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import TableSkeleton from "@/components/ui/TableSkeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const StockEntryList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [currentPage, setCurrentPage] = useState(0);
  
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
    totalCount,
    totalPages,
  } = useStockEntries(currentPage);

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
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <PageHeader title="Histórico de Compras" description="Consulte o histórico de compras de stock" />
        <TableSkeleton title="A carregar compras..." rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <PageHeader title="Histórico de Compras" description="Consulte o histórico de compras de stock" />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gestorApp-blue">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Total de compras: {totalCount}</span>
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

      <div className="bg-card rounded-lg shadow p-6">
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

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + Math.max(0, currentPage - 2);
                if (pageNum >= totalPages) return null;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default StockEntryList;
