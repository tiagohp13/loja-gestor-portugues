
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { Edit, Trash } from 'lucide-react';
import { formatDate } from '@/utils/formatting';

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory, deleteCategory, products } = useData();
  const [category, setCategory] = useState<any | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const foundCategory = getCategory(id);
      setCategory(foundCategory);

      // Filter products by this category
      const filteredProducts = products.filter(
        product => product.category === foundCategory?.name
      );
      setCategoryProducts(filteredProducts);
    }
  }, [id, getCategory, products]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Categoria não encontrada</h2>
          <p className="mb-4">A categoria que está a procurar não existe ou foi removida.</p>
          <Button onClick={() => navigate('/categorias/consultar')}>
            Voltar à Lista
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteCategory(id as string);
    navigate('/categorias/consultar');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={category.name}
        description={`Detalhes da categoria`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/categorias/consultar')}>
              Voltar à Lista
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/categorias/${id}/editar`)}
              className="flex items-center gap-2"
            >
              <Edit size={16} />
              Editar
            </Button>
            <DeleteConfirmDialog
              title="Eliminar Categoria"
              description="Tem certeza que deseja eliminar esta categoria? Esta ação não pode ser desfeita."
              onDelete={handleDelete}
              trigger={
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash size={16} />
                  Eliminar
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Detalhes da Categoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gestorApp-gray-dark mb-1">Nome</p>
              <p className="font-medium">{category.name}</p>
            </div>
            {category.description && (
              <div>
                <p className="text-sm text-gestorApp-gray-dark mb-1">Descrição</p>
                <p className="font-medium">{category.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gestorApp-gray-dark mb-1">Data de Criação</p>
              <p className="font-medium">{formatDate(category.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gestorApp-gray-dark mb-1">Última Atualização</p>
              <p className="font-medium">{formatDate(category.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Produtos Nesta Categoria</h2>
          
          {categoryProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gestorApp-gray-dark">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gestorApp-gray-dark">Nome</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gestorApp-gray-dark">Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gestorApp-gray-dark">Preço Venda</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryProducts.map(product => (
                    <tr 
                      key={product.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/produtos/${product.id}`)}
                    >
                      <td className="px-4 py-3 text-sm">{product.code}</td>
                      <td className="px-4 py-3 text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-right">{product.currentStock} unid.</td>
                      <td className="px-4 py-3 text-sm text-right">{product.salePrice.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gestorApp-gray-dark mb-2">Nenhum produto nesta categoria</p>
              <Link to="/produtos/novo" className="text-gestorApp-blue hover:underline">
                Adicionar produto
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
