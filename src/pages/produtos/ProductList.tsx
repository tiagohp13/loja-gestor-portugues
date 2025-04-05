
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/formatting';
import PageHeader from '@/components/ui/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductList = () => {
  const navigate = useNavigate();
  const { products, deleteProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este produto?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Produtos" 
        description="Consultar e gerir todos os produtos" 
        actions={
          <Button onClick={() => navigate('/produtos/novo')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
          <Input
            className="pl-10"
            placeholder="Pesquisar por nome ou código"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Preço Sugerido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gestorApp-gray">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.image && (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gestorApp-gray-light">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <span className={`${product.currentStock <= 0 ? 'text-red-500' : ''}`}>
                        {product.currentStock} unidades
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" title="Histórico">
                          <History className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Eliminar"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
