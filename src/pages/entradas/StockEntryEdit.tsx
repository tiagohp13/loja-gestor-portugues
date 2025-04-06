
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const StockEntryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries, updateStockEntry, products, suppliers } = useData();
  
  const [entry, setEntry] = useState({
    productId: '',
    supplierId: '',
    quantity: 0,
    purchasePrice: 0,
    date: '',
    invoiceNumber: ''
  });

  useEffect(() => {
    if (id) {
      const foundEntry = stockEntries.find(entry => entry.id === id);
      if (foundEntry) {
        setEntry({
          productId: foundEntry.productId || '',
          supplierId: foundEntry.supplierId || '',
          quantity: foundEntry.quantity || 0,
          purchasePrice: foundEntry.purchasePrice || 0,
          date: foundEntry.date ? new Date(foundEntry.date).toISOString().split('T')[0] : '',
          invoiceNumber: foundEntry.invoiceNumber || ''
        });
      } else {
        toast.error('Entrada não encontrada');
        navigate('/entradas/historico');
      }
    }
  }, [id, stockEntries, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' 
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      // Get the product associated with this entry
      const product = products.find(p => p.id === entry.productId);
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      
      if (!product || !supplier) {
        toast.error('Produto ou fornecedor não encontrado');
        return;
      }
      
      // Update the stock entry
      updateStockEntry(id, {
        ...entry,
        productName: product.name,
        supplierName: supplier.name
      });
      
      navigate('/entradas/historico');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Editar Entrada de Stock" 
        description="Atualize os detalhes da entrada de stock" 
        actions={
          <Button variant="outline" onClick={() => navigate('/entradas/historico')}>
            Voltar ao Histórico
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="productId" className="text-sm font-medium text-gestorApp-gray-dark">
                Produto
              </label>
              <select
                id="productId"
                name="productId"
                value={entry.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
                disabled
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gestorApp-gray">O produto não pode ser alterado após a criação</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="supplierId" className="text-sm font-medium text-gestorApp-gray-dark">
                Fornecedor
              </label>
              <select
                id="supplierId"
                name="supplierId"
                value={entry.supplierId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium text-gestorApp-gray-dark">
                Quantidade
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={entry.quantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="purchasePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço Unitário (€)
              </label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={entry.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gestorApp-gray-dark">
                Data
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={entry.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="invoiceNumber" className="text-sm font-medium text-gestorApp-gray-dark">
              Número da Fatura
            </label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={entry.invoiceNumber}
              onChange={handleChange}
              placeholder="FAT2023XXXX"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryEdit;
