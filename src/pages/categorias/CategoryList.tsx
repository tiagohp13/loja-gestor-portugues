import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash, Plus, Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import RecordCount from '@/components/common/RecordCount';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { categories, deleteCategory, products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesWithCount, setCategoriesWithCount] = useState<Category[]>([]);

  useEffect(() => {
    if (categories && products) {
      const updated = categories.map(cat => {
        const count = products.filter(prod => prod.category === cat.name).length;
        return { id: cat.id, name: cat.name, productCount: count };
      });
      setCategoriesWithCount(updated);
    }
  }, [categories, products]);

  const filteredCategories = categoriesWithCount.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewCategory = (id: string) => {
    navigate(`/categorias/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 1. Cabeçalho da página */}
      <PageHeader
        title="Categorias"
        description="Consultar e gerir todas as categorias"
        actions={
          <Button
            onClick={() => navigate('/categorias/nova')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Nova Categoria
          </Button>
        }
      />

      {/* 2. Contagem total */}
      <RecordCount title="Total de categorias" count={categories.length} />

      {/* 3. Área de busca e tabela */}
      <div className="mt-6">
        {/* 3.1 Campo de busca */}
        <div className="mb-4 w-full max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray"
              size={18}
            />
            <Input
              placeholder="Pesquisar por nome de categoria"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        {/* 3.2 Card da tabela */}
        {filteredCategories.length > 0 ? (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                    Produtos Associados
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map(category => (
                  <tr
                    key={category.id}
                    className="bg-white hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleViewCategory(category.id)}
                  >
                    <td className="px-4 py-4 text-sm text-gray-700">{category.name}</td>
                    <td className="px-4 py-4 text-center text-sm text-gray-700">
                      {category.productCount}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div
                        className="flex justify-end space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/categorias/editar/${category.id}`);
                          }}
                          className="text-gestorApp-gray hover:text-gestorApp-blue hover:bg-blue-50 transition-colors"
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
                              onClick={e => e.stopPropagation()}
                              className="hover:bg-red-50 transition-colors"
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
              <Button onClick={() => navigate('/categorias/nova')}>
                Criar Nova Categoria
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default CategoryList;
