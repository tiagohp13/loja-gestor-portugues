
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { StockEntryItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StockEntryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stockEntries, updateStockEntry, products, suppliers } = useData();
  
  const [entry, setEntry] = useState({
    supplierId: '',
    items: [] as StockEntryItem[],
    date: '',
    invoiceNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      const fetchEntry = async () => {
        try {
          const { data, error } = await supabase
            .from('stock_entries')
            .select(`
              *,
              stock_entry_items(*)
            `)
            .eq('id', id)
            .single();

          if (error) {
            console.error("Error fetching stock entry:", error);
            toast.error("Erro ao carregar entrada de stock");
            navigate('/entradas/historico');
            return;
          }

          if (data) {
            setEntry({
              supplierId: data.supplier_id || '',
              items: data.stock_entry_items.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                productName: item.product_name,
                quantity: item.quantity,
                purchasePrice: item.purchase_price,
                discountPercent: item.discount_percent || 0
              })),
              date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
              invoiceNumber: data.invoice_number || '',
              notes: data.notes || ''
            });
          }
        } catch (error) {
          console.error("Error in fetchEntry:", error);
          toast.error("Erro ao carregar entrada de stock");
          navigate('/entradas/historico');
        }
      };

      fetchEntry();
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof StockEntryItem, value: any) => {
    const updatedItems = [...entry.items];
    
    if (field === 'productId' && typeof value === 'string') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          productName: selectedProduct.name,
          purchasePrice: selectedProduct.purchasePrice || 0
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
    }
    
    setEntry(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addNewItem = () => {
    setEntry(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `temp-${Date.now()}`,
          productId: '',
          productName: '',
          quantity: 1,
          purchasePrice: 0,
          discountPercent: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = [...entry.items];
    updatedItems.splice(index, 1);
    setEntry(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (entry.items.length === 0) {
      toast.error("Adicione pelo menos um produto à entrada");
      return;
    }

    if (entry.items.some(item => !item.productId)) {
      toast.error("Selecione um produto para todos os itens");
      return;
    }

    if (entry.items.some(item => item.quantity <= 0)) {
      toast.error("A quantidade deve ser maior que zero para todos os itens");
      return;
    }

    if (id) {
      try {
        // Get the supplier associated with this entry
        const supplier = suppliers.find(s => s.id === entry.supplierId);
        
        if (!supplier) {
          toast.error('Fornecedor não encontrado');
          return;
        }
        
        // Update the stock entry
        const { error: entryError } = await supabase
          .from('stock_entries')
          .update({
            supplier_id: entry.supplierId,
            supplier_name: supplier.name,
            date: entry.date,
            invoice_number: entry.invoiceNumber,
            notes: entry.notes
          })
          .eq('id', id);
        
        if (entryError) {
          console.error("Error updating stock entry:", entryError);
          toast.error("Erro ao atualizar entrada de stock");
          return;
        }
        
        // Handle items - we need to update existing ones and create new ones
        for (const item of entry.items) {
          if (item.id.toString().startsWith('temp-')) {
            // This is a new item, create it
            const { error: newItemError } = await supabase
              .from('stock_entry_items')
              .insert({
                entry_id: id,
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                purchase_price: item.purchasePrice,
                discount_percent: item.discountPercent || 0
              });
            
            if (newItemError) {
              console.error("Error creating new item:", newItemError);
              toast.error(`Erro ao adicionar item: ${item.productName}`);
            }
          } else {
            // This is an existing item, update it
            const { error: updateItemError } = await supabase
              .from('stock_entry_items')
              .update({
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                purchase_price: item.purchasePrice,
                discount_percent: item.discountPercent || 0
              })
              .eq('id', item.id);
            
            if (updateItemError) {
              console.error("Error updating item:", updateItemError);
              toast.error(`Erro ao atualizar item: ${item.productName}`);
            }
          }
        }
        
        // Delete any items that were removed
        const originalItems = stockEntries.find(e => e.id === id)?.items || [];
        const keepItemIds = entry.items.filter(item => !item.id.toString().startsWith('temp-')).map(item => item.id);
        const itemsToDelete = originalItems.filter(item => !keepItemIds.includes(item.id));
        
        for (const item of itemsToDelete) {
          const { error: deleteError } = await supabase
            .from('stock_entry_items')
            .delete()
            .eq('id', item.id);
          
          if (deleteError) {
            console.error("Error deleting item:", deleteError);
            toast.error(`Erro ao remover item: ${item.productName}`);
          }
        }
        
        toast.success('Entrada atualizada com sucesso');
        navigate('/entradas/historico');
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        toast.error("Erro ao atualizar entrada de stock");
      }
    }
  };

  const calculateItemTotal = (item: StockEntryItem) => {
    return item.quantity * item.purchasePrice;
  };

  const calculateTotal = () => {
    return entry.items.reduce((total, item) => total + calculateItemTotal(item), 0);
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
          
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gestorApp-gray-dark">
                Produtos
              </label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addNewItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Preço Unitário
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gestorApp-gray-dark uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entry.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, 'productId', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          className="w-24"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.purchasePrice}
                          onChange={(e) => handleItemChange(index, 'purchasePrice', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {calculateItemTotal(item).toFixed(2)} €
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {calculateTotal().toFixed(2)} €
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={entry.notes}
              onChange={handleChange}
              placeholder="Observações adicionais sobre a entrada..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gestorApp-blue focus:border-gestorApp-blue"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/entradas/historico')}>
              Cancelar
            </Button>
            <Button type="submit">
              Atualizar Entrada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockEntryEdit;
