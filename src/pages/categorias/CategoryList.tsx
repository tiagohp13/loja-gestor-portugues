import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import RecordCount from '@/components/common/RecordCount';

type SortField = 'name' | 'productCount';
type SortDirection = 'asc' | 'desc';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, products } = useData();
  const { accessLevel, canCreate, canEdit, canDelete, loading } = usePermissions();

  // DEBUG: imprime no console as permissões do utilizador
  console.log('PERMISSIONS:', {
    accessLevel,
    canCreate,
    canEdit,
    canDelete
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesWithCount, setCategoriesWithCount] = useState(categories);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  useEffect(() => {
    if (categories && products) {
      const updated = categories.map(cat => ({
        ...cat,
        productCount: products.filter(p => p.category === cat.name).length
      }));
      setCategoriesWithCount(updated);
    }
  }, [categories, products]);
  
  if (loading) return null; // ou spinner
  
  const filtered = categoriesWithCount.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sorted = filtered.sort((a, b) => {
    const aVal = sortField === 'name' ? a.name.toLowerCase() : a.productCount || 0;
    const bVal = sortField === 'name' ? b.name.toLowerCase() : b.productCount || 0;
    if (sortDirection === 'asc') return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
  });
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={16} className="ml-1" />;
    return sortDirection === 'asc'
      ? <ArrowUp size={16} className="ml-1" />
      : <ArrowDown size={16} className="ml-1" />;
  };
  
  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Categorias"
          description="Consultar e gerir todas as categorias"
          actions={
            canCreate && (
              <Button onClick={() => navigate('/categorias/nova')} className="flex items-center gap-2">
                <Plus size={16} /> Nova Categoria
              </Button>
            )
          }
        />
        
        <RecordCount 
          title="Total de categorias"
          count={categories.length}
        />
        
        <div className="bg-white dark:bg-card rounded-lg shadow p-6 mt-6">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" size={18} />
            <Input
              placeholder="Pesquisar por nome de categoria"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => {
              setSortField('name');
              setSortDirection(sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc');
            }} className="flex items-center gap-1">
              Nome {getSortIcon('name')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setSortField('productCount');
              setSortDirection(sortField === 'productCount' && sortDirection === 'asc' ? 'desc' : 'asc');
            }} className="flex items-center gap-1">
              Produtos {getSortIcon('productCount')}
            </Button>
          </div>
          
          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sorted.map(category => (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-muted/50"
                  onClick={() => navigate(`/categorias/${category.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer line-clamp-1">{category.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{category.description || 'Sem descrição disponível'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Package size={16} />
                      <span className="text-sm">
                        {category.productCount} produto{category.productCount !== 1 ? 's' : ''} associado{category.productCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      {canEdit && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/categorias/editar/${category.id}`);
                          }}
                        >
                          <Edit size={14} className="mr-1" /> Editar
                        </Button>
                      )}
                      {canDelete && (
                        <DeleteConfirmDialog
                          title="Eliminar Categoria"
                          description="Tem certeza que deseja eliminar esta categoria? Esta ação não pode ser desfeita."
                          onDelete={() => deleteCategory(category.id)}
                          trigger={
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={e => e.stopPropagation()}
                            >
                              <Trash size={14} />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem categorias"
              description="Não existem categorias cadastradas ou que correspondam à pesquisa."
              icon="tag"
              action={
                canCreate && (
                  <Button onClick={() => navigate('/categorias/nova')}>
                    Criar Nova Categoria
                  </Button>
                )
              }
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CategoryList;
