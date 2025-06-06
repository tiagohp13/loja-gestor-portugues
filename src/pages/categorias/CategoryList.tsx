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
  iconUrl?: string; // opcional, ícone de categoria
  status?: 'Ativa' | 'Inativa';
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
        return {
          id: cat.id,
          name: cat.name,
          productCount: count,
          status: 'Ativa', // pode vir do backend
          iconUrl: `/icons/${cat.name.toLowerCase()}.svg` // substitua conforme necessário
        } as Category;
      });
      setCategoriesWithCount(updated);
    }
  }, [categories, products]);

  const filtered = categoriesWithCount.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Categorias"
        description="Consultar e gerir todas as categorias"
        actions={
          <Button onClick={() => navigate('/categorias/nova')} className="flex items-center gap-2">
            <Plus size={16} /> Nova Categoria
          </Button>
        }
      />

      <RecordCount title="Total de categorias" count={categories.length} />

      <div className="mt-6 mb-4 w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Pesquisar por nome de categoria"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 cursor-pointer"
              onClick={() => navigate(`/categorias/${cat.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {cat.iconUrl && (
                    <img
                      src={cat.iconUrl}
                      alt={cat.name}
                      className="w-8 h-8 mr-3 object-contain"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
                </div>
                {cat.status && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      cat.status === 'Ativa'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cat.status}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">{cat.productCount} produtos</p>
              <div className="mt-4 flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/categorias/editar/${cat.id}`);
                  }}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit size={16} />
                </Button>
                <DeleteConfirmDialog
                  title="Eliminar Categoria"
                  description="Tem certeza que deseja eliminar esta categoria? Esta ação não pode ser desfeita."
                  onDelete={() => deleteCategory(cat.id)}
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
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sem categorias"
          description="Não existem categorias cadastradas ou que correspondam à pesquisa."
          icon="tag"
          action={<Button onClick={() => navigate('/categorias/nova')}>Criar Nova Categoria</Button>}
        />
      )}
    </div>
  );
};

export default CategoryList;
