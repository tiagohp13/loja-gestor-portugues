
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Edit, Trash2, History, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/formatting';
import PageHeader from '@/components/ui/PageHeader';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type SortField = 'name' | 'code' | 'category' | 'currentStock' | 'salePrice';
type SortDirection = 'asc' | 'desc';

const ProductList = () => {
  const navigate = useNavigate();
  const { products, deleteProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'code') {
        return sortDirection === 'asc' 
          ? a.code.localeCompare(b.code) 
          : b.code.localeCompare(a.code);
      } else if (sortField === 'category') {
        return sortDirection === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      } else if (sortField === 'currentStock') {
        return sortDirection === 'asc' 
          ? a.currentStock - b.currentStock 
          : b.currentStock - a.currentStock;
      } else if (sortField === 'salePrice') {
        return sortDirection === 'asc' 
          ? a.salePrice - b.salePrice 
          : b.salePrice - a.salePrice;
      }
      return 0;
    });

  const handleViewProduct = (id: string) => {
    navigate(`/produtos/${id}`);
  };

  const handleViewHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/produtos/${id}?tab=history`);
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/produtos/${id}/editar`);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
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
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
            <Input
              className="pl-10"
              placeholder="Pesquisar por nome ou código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <Select 
              value={sortField} 
              onValueChange={(value) => setSortField(value as SortField)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="code">Código</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="currentStock">Stock</SelectItem>
                <SelectItem value="salePrice">Preço</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
        
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
                    Produto
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Categoria
                    {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('currentStock')}
                >
                  <div className="flex items-center">
                    Stock
                    {getSortIcon('currentStock')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('salePrice')}
                >
                  <div className="flex items-center">
                    Preço Sugerido
                    {getSortIcon('salePrice')}
                  </div>
                </TableHead>
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
                  <TableRow 
                    key={product.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewProduct(product.id)}
                  >
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
                      <span className={`${product.currentStock <= (product.minStock || 0) ? 'text-red-500' : ''}`}>
                        {product.currentStock} unidades
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Histórico"
                          onClick={(e) => handleViewHistory(product.id, e)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Editar"
                          onClick={(e) => handleEdit(product.id, e)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DeleteConfirmDialog
                          title="Eliminar Produto"
                          description={`Tem a certeza que deseja eliminar o produto "${product.name}"?`}
                          onDelete={() => handleDelete(id)}
                          trigger={
                            <Button variant="outline" size="sm" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
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
