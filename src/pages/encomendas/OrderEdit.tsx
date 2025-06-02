import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PageHeader from '@/components/ui/PageHeader';
import { OrderItem } from '@/types';

interface Params {
  id: string;
}

const OrderEdit = () => {
  const { id } = useParams<Params>();
  const navigate = useNavigate();
  const { products, clients, orders, updateOrder } = useData();
  const [orderData, setOrderData] = useState<any>({ items: [] });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      const order = orders.find(o => o.id === id);
      if (order) {
        setOrderData(order);
      }
    }
  }, [id, orders]);
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setSearchTerm('');
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 1 : value);
  };
  
  const removeItem = (itemId: string) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const addProduct = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const existingItemIndex = orderData.items.findIndex(
      item => item.productId === selectedProduct.id
    );
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderData.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        salePrice: selectedProduct.salePrice,
        discountPercent: 0,
        updatedAt: new Date().toISOString()
      } as OrderItem;
      
      setOrderData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      const newItem: OrderItem = {
        id: crypto.randomUUID(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        salePrice: selectedProduct.salePrice,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setOrderData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
    
    setSelectedProduct(null);
    setQuantity(1);
  };
  
  const calculateTotal = () => {
    let total = 0;
    if (orderData.items && orderData.items.length > 0) {
      total = orderData.items.reduce((sum, item) => {
        const itemPrice = item.salePrice * item.quantity;
        const discount = item.discountPercent ? (itemPrice * (item.discountPercent / 100)) : 0;
        return sum + (itemPrice - discount);
      }, 0);
    }
    
    // Apply order-level discount if applicable
    if (orderData.discount && total > 0) {
      total = total * (1 - (orderData.discount / 100));
    }
    
    return total;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateOrder(id as string, orderData);
      toast({
        title: "Sucesso",
        description: "Encomenda atualizada com sucesso",
      });
      navigate('/encomendas');
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar encomenda",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!orderData) {
    return <div>Encomenda não encontrada...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Editar Encomenda" 
        description="Edite os detalhes da encomenda"
        actions={
          <Button onClick={() => navigate('/encomendas')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        }
      />
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Cliente</Label>
                <Input 
                  type="text" 
                  id="clientName" 
                  name="clientName"
                  value={orderData.clientName || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input 
                  type="date" 
                  id="date" 
                  name="date"
                  value={orderData.date || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea 
                id="notes" 
                name="notes"
                value={orderData.notes || ''}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productSearch">Produto</Label>
                <Input
                  type="text"
                  id="productSearch"
                  placeholder="Pesquisar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="absolute z-10 bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        {product.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
            </div>
            <Button type="button" onClick={addProduct} disabled={!selectedProduct}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
            </Button>
          </CardContent>
        </Card>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Items da Encomenda</CardTitle>
          </CardHeader>
          <CardContent>
            {orderData.items.length === 0 ? (
              <div className="text-center py-4">Nenhum item adicionado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Unitário
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderData.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.salePrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-right">
              Total: {calculateTotal()}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "A atualizar..." : "Atualizar Encomenda"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderEdit;
