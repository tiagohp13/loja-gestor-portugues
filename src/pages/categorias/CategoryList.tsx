
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesWithCount, setCategoriesWithCount] = useState(categories);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  useEffect(() => {
    if (categories && products) {
      // Calculate product counts for each category
      const updatedCategories = categories.map(category => {
        const productCount = products.filter(product => product.category === category.name).length;
        return { ...category, productCount };
      });
      setCategoriesWithCount(updatedCategories);
    }
  }, [categories, products]);
  
  const filteredCategories = categoriesWithCount?.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort categories based on current sort field and direction
  const sortedCategories = filteredCategories?.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    if (sortField === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else {
      aValue = a.productCount || 0;
      bValue = b.productCount || 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={16} className="ml-1" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp size={16} className="ml-1" /> : 
      <ArrowDown size={16} className="ml-1" />;
  };
  
  const handleViewCategory = (id: string) => {
    navigate(`/categorias/${id}`);
  };
  
  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Categorias"
          description="Consultar e gerir todas as categorias"
          actions={
            <Button onClick={() => navigate('/categorias/nova')} className="flex items-center gap-2">
              <Plus size={16} />
              Nova Categoria
            </Button>
          }
        />
        
        <RecordCount 
          title="Total de categorias"
          count={categories.length}
        />
        
        <div className="bg-white dark:bg-card rounded-lg shadow p-6 mt-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" size={18} />
              <Input
                placeholder="Pesquisar por nome de categoria"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className="flex items-center gap-1"
            >
              Nome
              {getSortIcon('name')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('productCount')}
              className="flex items-center gap-1"
            >
              Produtos
              {getSortIcon('productCount')}
            </Button>
          </div>
          
          {sortedCategories && sortedCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedCategories.map(category => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-muted/50"
                  onClick={() => handleViewCategory(category.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer line-clamp-1">
                            {category.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {category.description || 'Sem descrição disponível'}
                          </p>
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
                    
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/categorias/editar/${category.id}`);
                        }}
                      >
                        <Edit size={14} className="mr-1" />
                        Editar
                      </Button>
                      <DeleteConfirmDialog
                        title="Eliminar Categoria"
                        description="Tem certeza que deseja eliminar esta categoria? Esta ação não pode ser desfeita."
                        onDelete={() => deleteCategory(category.id)}
                        trigger={
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash size={14} />
                          </Button>
                        }
                      />
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
                <Button onClick={() => navigate('/categorias/nova')}>Criar Nova Categoria</Button>
              }
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CategoryList;
