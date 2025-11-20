import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Package, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/ui/PageHeader";
import RecordCount from "@/components/common/RecordCount";
import ProductTableRow from "./components/ProductTableRow";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { usePermissions } from "@/hooks/usePermissions";
import { validatePermission } from "@/utils/permissionUtils";
import TableSkeleton from "@/components/ui/TableSkeleton";
import { usePaginatedProducts } from "@/hooks/queries/usePaginatedProducts";
import { useProductsQuery } from "@/hooks/queries/useProducts";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ProductList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL_CATEGORIES");
  
  const { categories } = useCategoriesQuery();
  const { canCreate, canEdit, canDelete } = usePermissions();
  
  // Check if filters are active
  const hasFilters = searchTerm !== "" || categoryFilter !== "ALL_CATEGORIES";
  
  // Use paginated query when no filters, full query when filters active
  const { 
    products: paginatedProducts, 
    totalCount: paginatedCount, 
    totalPages, 
    isLoading: isPaginatedLoading, 
    deleteProduct: deletePaginated 
  } = usePaginatedProducts(currentPage);
  
  const { 
    products: allProducts, 
    isLoading: isAllLoading, 
    deleteProduct: deleteAll 
  } = useProductsQuery();

  useScrollToTop();

  useEffect(() => {
    const categoria = searchParams.get("categoria");
    if (categoria) {
      setCategoryFilter(categoria);
    }
  }, [searchParams]);

  // Determine which data to use
  const products = hasFilters ? allProducts : paginatedProducts;
  const isLoading = hasFilters ? isAllLoading : isPaginatedLoading;
  const deleteProduct = hasFilters ? deleteAll : deletePaginated;
  const totalCount = hasFilters ? allProducts.length : paginatedCount;

  const filteredProducts = hasFilters 
    ? products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "ALL_CATEGORIES" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
    : products;

  const handleViewProduct = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  const handleViewHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/produtos/${id}?tab=history`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!validatePermission(canEdit, "editar produtos")) return;
    navigate(`/produtos/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    if (!validatePermission(canDelete, "eliminar produtos")) return;
    deleteProduct(id);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("ALL_CATEGORIES");
  };

  const uniqueCategories = [...new Set((categories || []).map((cat) => cat.name))].sort();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Produtos"
          description="Consultar e gerir todos os produtos"
        />
        <TableSkeleton title="A carregar produtos..." rows={5} columns={7} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Produtos"
        description="Consultar e gerir todos os produtos"
        actions={
          canCreate && (
            <Button
              onClick={() => {
                if (!validatePermission(canCreate, "criar produtos")) return;
                navigate("/produtos/novo");
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          )
        }
      />

      <RecordCount title="Total de produtos" count={totalCount} icon={Package} />

      <div className="bg-card rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por nome ou código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_CATEGORIES">Todas as categorias</SelectItem>
                {uniqueCategories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || categoryFilter !== "ALL_CATEGORIES") && (
              <Button variant="outline" onClick={clearFilters} title="Limpar filtros">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {(searchTerm || categoryFilter !== "ALL_CATEGORIES") && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <Badge variant="secondary">
                Pesquisa: {searchTerm}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {categoryFilter !== "ALL_CATEGORIES" && (
              <Badge variant="secondary">
                Categoria: {categoryFilter}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setCategoryFilter("ALL_CATEGORIES")} />
              </Badge>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Preço Sugerido</TableCell>
                <TableCell className="text-center pr-4 w-[220px]">Ações</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                    A carregar produtos...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    onViewProduct={handleViewProduct}
                    onViewHistory={handleViewHistory}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination - only show when no filters are active */}
        {!hasFilters && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i)}
                      isActive={currentPage === i}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
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
    </div>
  );
};

export default ProductList;
