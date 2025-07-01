
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
        
        <div className="bg-white rounded-lg shadow p-6 mt-6">
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
          
          {sortedCategories && sortedCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gestorApp-gray-dark cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nome
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-medium text-gestorApp-gray-dark cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('productCount')}
                    >
                      <div className="flex items-center">
                        Produtos Associados
                        {getSortIcon('productCount')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gestorApp-gray-dark">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map(category => (
                    <tr 
                      key={category.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewCategory(category.id)}
                    >
                      <td className="px-4 py-3 text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer">
                              {category.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {category.description || 'Sem descrição disponível'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3 text-sm">{category.productCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/categorias/editar/${category.id}`);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <DeleteConfirmDialog
                            title="Eliminar Categoria"
                            description="Tem certeza que deseja eliminar esta categoria? Esta ação não pode ser desfeita."
                            onDelete={() => deleteCategory(category.id)}
                            trigger={
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash size={16} />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
