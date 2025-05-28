import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import RecordCount from '@/components/common/RecordCount';
import { Search, Plus, Tag } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const CategoryList = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { categories, deleteCategory } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCategory = (id: string) => {
    navigate(`/categorias/${id}`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/categorias/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const handleAddCategory = () => {
    navigate('/categorias/nova');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Categorias" 
        description="Consultar e gerir todas as categorias" 
      />
      
      <RecordCount 
        title="Total de categorias"
        count={categories.length}
        icon={Tag}
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por nome ou descrição"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Descrição</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(category => (
                <tr 
                  key={category.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewCategory(category.id)}
                >
                  <td className="p-3 font-medium">{category.name}</td>
                  <td className="p-3 text-gray-600">{category.description}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleEdit(category.id, e)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma categoria encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
