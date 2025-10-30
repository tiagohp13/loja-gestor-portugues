import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoriesQuery } from '@/hooks/queries/useCategories';
import { useProductsQuery } from '@/hooks/queries/useProducts';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus, Search, ArrowUp, ArrowDown, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { checkCategoryDependencies } from '@/utils/dependencyUtils';
import EmptyState from '@/components/common/EmptyState';
import RecordCount from '@/components/common/RecordCount';
import CategoryProductsModal from './components/CategoryProductsModal';
import TableSkeleton from '@/components/ui/TableSkeleton';

type SortField = 'name' | 'productCount';
type SortDirection = 'asc' | 'desc';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, isLoading } = useCategoriesQuery();
  const { products } = useProductsQuery();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  
  const handleCreateCategory = () => {
    if (!validatePermission(canCreate, 'criar categorias')) return;
    navigate('/categorias/nova');
  };

  const handleEditCategory = (id: string) => {
    if (!validatePermission(canEdit, 'editar categorias')) return;
    navigate(`/categorias/editar/${id}`);
  };

  const handleDeleteCategory = (id: string) => {
    if (!validatePermission(canDelete, 'eliminar categorias')) return;
    deleteCategory(id);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryProductCount = (categoryName: string) => {
    return products.filter(product => product.category === categoryName).length;
  };

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'productCount') {
      const aCount = getCategoryProductCount(a.name);
      const bCount = getCategoryProductCount(b.name);
      return sortDirection === 'asc' ? aCount - bCount : bCount - aCount;
    }
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCategoryClick = (categoryId: string, categoryName: string, e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedCategory({ id: categoryId, name: categoryName });
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Categorias"
          description="Consultar e gerir todas as categorias"
        />
        <TableSkeleton title="A carregar categorias..." rows={5} columns={3} />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Categorias"
          description="Consultar e gerir todas as categorias"
          actions={
            canCreate && (
              <Button onClick={handleCreateCategory} className="flex items-center gap-2">
                <Plus size={16} /> Nova Categoria
              </Button>
            )
          }
        />

        {selectedCategory && (
          <CategoryProductsModal
            isOpen={!!selectedCategory}
            onClose={handleCloseModal}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
          />
        )}

        <RecordCount title="Total de categorias" count={categories.length} />

        <div className="bg-card rounded-lg shadow p-6 mt-6">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" size={18} />
            <Input
              placeholder="Pesquisar por nome de categoria"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gestorApp-gray">Ordenar por:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('name')}
                className="flex items-center gap-1"
              >
                Nome
                {sortField === 'name' && (
                  sortDirection === 'asc' ? 
                    <ArrowUp size={14} /> : 
                    <ArrowDown size={14} />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('productCount')}
                className="flex items-center gap-1"
              >
                Produtos
                {sortField === 'productCount' && (
                  sortDirection === 'asc' ? 
                    <ArrowUp size={14} /> : 
                    <ArrowDown size={14} />
                )}
              </Button>
            </div>
          </div>

          {sortedCategories.length === 0 ? (
            <EmptyState 
              title="Nenhuma categoria encontrada"
              description={searchTerm ? "Tente ajustar os filtros de pesquisa" : "Comece por criar uma nova categoria"}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedCategories.map((category) => {
                const productCount = getCategoryProductCount(category.name);
                return (
                  <Card 
                    key={category.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={(e) => handleCategoryClick(category.id, category.name, e)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Package size={18} className="text-gestorApp-blue shrink-0" />
                          <span className="text-lg truncate">{category.name}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 shrink-0">
                          {canEdit && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCategory(category.id);
                                  }}
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar categoria</TooltipContent>
                            </Tooltip>
                          )}
                          {canDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DeleteConfirmDialog
                                  title="Eliminar Categoria"
                                  description="Tem a certeza que deseja eliminar esta categoria?"
                                  onDelete={() => handleDeleteCategory(category.id)}
                                  checkDependencies={() => checkCategoryDependencies(category.name)}
                                  trigger={
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <Trash size={16} />
                                    </Button>
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent>Eliminar categoria</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.description && (
                          <p className="text-sm text-gestorApp-gray">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-gestorApp-gray">Produtos:</span>
                          <span className="text-sm font-medium text-gestorApp-blue">
                            {productCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CategoryList;
