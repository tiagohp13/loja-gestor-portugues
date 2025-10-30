
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCategories } from '@/contexts/CategoriesContext';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Edit, ChevronUp, ChevronDown } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { validatePermission } from '@/utils/permissionUtils';
import { formatDate } from '@/utils/formatting';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortField, SortDirection } from '@/pages/produtos/hooks/useProductSort';
import { naturalSort } from '@/pages/produtos/hooks/useProductSort';

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory } = useCategories();
  const { products } = useProducts();
  const { canEdit, canCreate } = usePermissions();
  const [category, setCategory] = useState<any | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  useEffect(() => {
    // Apply sorting to the products when sortField or sortDirection changes
    if (categoryProducts.length > 0) {
      const sortedProducts = [...categoryProducts].sort((a, b) => {
        if (sortField === 'name' || sortField === 'code' || sortField === 'category') {
          return naturalSort(String(a[sortField] || ''), String(b[sortField] || ''), sortDirection);
        } else {
          // For numeric fields
          const aValue = a[sortField] || 0;
          const bValue = b[sortField] || 0;
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
      });
      setCategoryProducts(sortedProducts);
    }
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

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

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={category.name}
        description={`Detalhes da categoria`}
        actions={
          <div className="flex space-x-2">
            {canEdit && (
              <Button 
                onClick={() => {
                  if (!validatePermission(canEdit, 'editar categorias')) return;
                  navigate(`/categorias/editar/${id}`);
                }}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Editar
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/categorias/consultar')}>
              Voltar à Lista
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-card rounded-lg shadow p-6">
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

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Produtos Nesta Categoria</h2>
          
          {categoryProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center">
                        Código
                        {getSortIcon('code')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nome
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort('currentStock')}
                    >
                      <div className="flex items-center justify-end">
                        Stock
                        {getSortIcon('currentStock')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort('salePrice')}
                    >
                      <div className="flex items-center justify-end">
                        Preço Venda
                        {getSortIcon('salePrice')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryProducts.map(product => (
                    <TableRow 
                      key={product.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/produtos/${product.id}`)}
                    >
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.currentStock} unid.</TableCell>
                      <TableCell className="text-right">{product.salePrice.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gestorApp-gray-dark mb-2">Nenhum produto nesta categoria</p>
              {canCreate && (
                <Link to="/produtos/novo" className="text-gestorApp-blue hover:underline">
                  Adicionar produto
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
