
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus, Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesWithCount, setCategoriesWithCount] = useState(categories);
  
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
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleViewCategory = (id: string) => {
    navigate(`/categorias/${id}`);
  };
  
  return (
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
        
        {filteredCategories && filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gestorApp-gray-dark">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gestorApp-gray-dark">Produtos Associados</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gestorApp-gray-dark">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(category => (
                  <tr 
                    key={category.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewCategory(category.id)}
                  >
                    <td className="px-4 py-3 text-sm">{category.name}</td>
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
  );
};

export default CategoryList;
