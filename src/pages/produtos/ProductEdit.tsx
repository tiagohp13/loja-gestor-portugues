
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, updateProduct, categories } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [product, setProduct] = useState({
    name: '',
    code: '',
    purchasePrice: 0,
    salePrice: 0,
    currentStock: 0,
    minStock: 0,
    category: '',
    description: '',
    image: ''
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    if (id) {
      const foundProduct = getProduct(id);
      if (foundProduct) {
        setProduct({
          name: foundProduct.name || '',
          code: foundProduct.code || '',
          purchasePrice: foundProduct.purchasePrice || 0,
          salePrice: foundProduct.salePrice || 0,
          currentStock: foundProduct.currentStock || 0,
          minStock: foundProduct.minStock || 0,
          category: foundProduct.category || '',
          description: foundProduct.description || '',
          image: foundProduct.image || ''
        });
        
        if (foundProduct.image) {
          setPreviewImage(foundProduct.image);
        }
      } else {
        toast.error('Produto não encontrado');
        navigate('/produtos/consultar');
      }
    }
  }, [id, getProduct, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'purchasePrice' || name === 'salePrice' || name === 'currentStock' || name === 'minStock'
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
      toast.error('Apenas imagens JPG ou PNG são permitidas');
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setImageUrl('');
    
    // In a real app, you would upload the file to a server
    // For now, we'll just use the object URL
    setProduct(prev => ({
      ...prev,
      image: objectUrl
    }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const handleImageUrlSubmit = () => {
    if (!imageUrl) {
      toast.error('Por favor, insira um URL de imagem válido');
      return;
    }

    // Set the preview and the product image to the URL
    setPreviewImage(imageUrl);
    setProduct(prev => ({
      ...prev,
      image: imageUrl
    }));
    toast.success('Imagem adicionada com sucesso');
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageUrl('');
    setProduct(prev => ({
      ...prev,
      image: ''
    }));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateProduct(id, product);
      navigate(`/produtos/${id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Editar Produto" 
        description="Atualize os detalhes do produto" 
        actions={
          <Button variant="outline" onClick={() => navigate(`/produtos/${id}`)}>
            Voltar aos Detalhes
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
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gestorApp-gray-dark">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              >
                <option value="">Selecione uma categoria</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="purchasePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço de Compra (€)
              </label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={product.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="salePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço de Venda (€)
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
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="currentStock" className="text-sm font-medium text-gestorApp-gray-dark">
                Stock Atual
              </label>
              <Input
                id="currentStock"
                name="currentStock"
                type="number"
                min="0"
                value={product.currentStock}
                onChange={handleChange}
                placeholder="0"
                disabled
              />
              <p className="text-xs text-gestorApp-gray">O stock é atualizado automaticamente através de entradas e saídas</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="minStock" className="text-sm font-medium text-gestorApp-gray-dark">
                Stock Mínimo
              </label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                min="0"
                value={product.minStock}
                onChange={handleChange}
                placeholder="0"
              />
              <p className="text-xs text-gestorApp-gray">Definir para alertas de stock baixo</p>
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
          
          <div className="space-y-4">
            <label className="text-sm font-medium text-gestorApp-gray-dark">
              Imagem do Produto
            </label>
            
            <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="upload">Carregar ficheiro</TabsTrigger>
                <TabsTrigger value="url">URL da imagem</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                {previewImage && activeTab === 'upload' ? (
                  <div className="relative w-48 h-48 border rounded-md overflow-hidden">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gestorApp-gray-light rounded-md p-6 flex flex-col items-center justify-center h-48 w-48 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gestorApp-gray" />
                    <p className="mt-2 text-sm text-gestorApp-gray text-center">
                      Clique para carregar uma imagem<br />(JPG ou PNG)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="url">
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleImageUrlSubmit}
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Adicionar</span>
                    </Button>
                  </div>
                  
                  {previewImage && activeTab === 'url' && (
                    <div className="relative w-48 h-48 border rounded-md overflow-hidden">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={() => {
                          toast.error('Erro ao carregar a imagem. Verifique o URL.');
                          setPreviewImage(null);
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate(`/produtos/${id}`)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
