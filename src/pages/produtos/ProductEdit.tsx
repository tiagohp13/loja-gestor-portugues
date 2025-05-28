import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const ProductEdit = () => {
  useScrollToTop();
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct, categories } = useData();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    salePrice: '',
    purchasePrice: '',
    currentStock: '',
    minStock: '',
    imageUrl: ''
  });

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        code: product.code,
        description: product.description || '',
        category: product.category,
        salePrice: product.salePrice.toString(),
        purchasePrice: product.purchasePrice?.toString() || '',
        currentStock: product.currentStock.toString(),
        minStock: product.minStock?.toString() || '',
        imageUrl: product.imageUrl || ''
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate('/produtos/consultar')}>
            Voltar ao Catálogo
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.category || !formData.salePrice) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      code: formData.code,
      description: formData.description,
      category: formData.category,
      salePrice: parseFloat(formData.salePrice),
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      currentStock: parseInt(formData.currentStock) || 0,
      minStock: parseInt(formData.minStock) || 0,
      imageUrl: formData.imageUrl
    };

    updateProduct(updatedProduct);
    toast.success('Produto atualizado com sucesso!');
    navigate(`/produtos/${product.id}`);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title={`Editar: ${product.name}`} 
        description={`Código: ${product.code}`}
        actions={
          <Button variant="outline" onClick={() => navigate(`/produtos/${product.id}`)}>
            Voltar aos Detalhes
          </Button>
        }
      />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
          <CardDescription>
            Edite os dados do produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nome do produto"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="Código único do produto"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  placeholder="URL da imagem do produto"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Preço de Venda *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Preço de Compra</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Stock Atual</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => handleChange('currentStock', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => handleChange('minStock', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Guardar Alterações
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/produtos/${product.id}`)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEdit;
