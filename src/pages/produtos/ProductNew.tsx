
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';

const ProductNew = () => {
  const navigate = useNavigate();
  const { addProduct } = useData();
  const [product, setProduct] = useState({
    name: '',
    code: '',
    purchasePrice: 0,
    salePrice: 0,
    currentStock: 0,
    category: '',
    description: '',
    image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'purchasePrice' || name === 'salePrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(product);
    navigate('/produtos/consultar');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Criar Novo Produto" 
        description="Adicione um novo produto ao inventário" 
        actions={
          <Button variant="outline" onClick={() => navigate('/produtos/consultar')}>
            Voltar à Lista
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gestorApp-gray-dark">
                Código Interno
              </label>
              <Input
                id="code"
                name="code"
                value={product.code}
                onChange={handleChange}
                placeholder="Introduza o código interno"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gestorApp-gray-dark">
                Nome do Produto
              </label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Introduza o nome do produto"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gestorApp-gray-dark">
                Categoria
              </label>
              <Input
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                placeholder="Categoria do produto"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="salePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço Sugerido (€)
              </label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                min="0"
                value={product.salePrice}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gestorApp-gray-dark">
              Descrição
            </label>
            <Textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Descrição detalhada do produto"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium text-gestorApp-gray-dark">
              URL da Imagem
            </label>
            <Input
              id="image"
              name="image"
              value={product.image}
              onChange={handleChange}
              placeholder="URL da imagem do produto"
            />
            {product.image && (
              <div className="mt-2 w-32 h-32 border rounded-md overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/produtos/consultar')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Produto</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductNew;
