
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { useProductSort, naturalSort } from './hooks/useProductSort';
import ProductListHeader from './components/ProductListHeader';
import ProductTable from './components/ProductTable';
import { Plus } from 'lucide-react';

const ProductList = () => {
  const navigate = useNavigate();
  const { products, deleteProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const { sortField, sortDirection, handleSort, setSortField, setSortDirection } = useProductSort();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        // Use natural sort for code field
        return naturalSort(a.code, b.code, sortDirection);
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
    navigate(`/produtos/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const handleAddProduct = () => {
    navigate('/produtos/novo');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Produtos" 
        description="Consultar e gerir todos os produtos" 
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <ProductListHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          onAddProduct={handleAddProduct}
        />
        
        <ProductTable
          filteredProducts={filteredProducts}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          onViewProduct={handleViewProduct}
          onViewHistory={handleViewHistory}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ProductList;
