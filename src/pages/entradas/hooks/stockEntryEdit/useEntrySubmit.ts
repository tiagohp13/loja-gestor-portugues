
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockEntryFormState } from './types';
import { supabase, withUserData } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { StockEntryItem } from '@/types';

export const useEntrySubmit = (id: string | undefined, entry: StockEntryFormState) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isNewEntry = !id;

  // Get products and suppliers from the window object (populated by DataContext)
  // This avoids circular dependencies
  const { suppliers, stockEntries } = window;

  const validateForm = () => {
    if (entry.items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto à entrada",
        variant: "destructive"
      });
      return false;
    }

    if (!entry.supplierId) {
      toast({
        title: "Erro",
        description: "Selecione um fornecedor",
        variant: "destructive"
      });
      return false;
    }

    if (entry.items.some(item => !item.productId)) {
      toast({
        title: "Erro",
        description: "Selecione um produto para todos os itens",
        variant: "destructive"
      });
      return false;
    }

    if (entry.items.some(item => item.quantity <= 0)) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero para todos os itens",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Get the supplier associated with this entry
      const supplier = suppliers?.find(s => s.id === entry.supplierId);
      
      if (!supplier) {
        toast({
          title: "Erro",
          description: "Fornecedor não encontrado",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (id) {
        await updateExistingEntry(id, supplier);
      } else {
        await createNewEntry(supplier);
      }
      
      toast({
        title: "Sucesso",
        description: id ? "Entrada atualizada com sucesso" : "Entrada criada com sucesso"
      });
      navigate('/entradas/historico');
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar entrada de stock",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateExistingEntry = async (entryId: string, supplier: any) => {
    // Fix: Get the existing entry to get its 'number' field
    const existingEntry = stockEntries?.find(e => e.id === entryId);
    
    if (!existingEntry) {
      throw new Error('Entrada não encontrada');
    }
    
    const entryData = {
      supplier_id: entry.supplierId,
      supplier_name: supplier.name,
      date: entry.date,
      invoice_number: entry.invoiceNumber,
      notes: entry.notes,
      // Include the number field from the existing entry
      number: existingEntry.number
    };
    
    // Add user_id to maintain ownership with RLS
    const securedEntryData = await withUserData(entryData);
    
    const { error: entryError } = await supabase
      .from('stock_entries')
      .update(securedEntryData)
      .eq('id', entryId);
    
    if (entryError) {
      console.error("Error updating stock entry:", entryError);
      throw new Error("Erro ao atualizar entrada de stock");
    }
    
    // Handle items - we need to update existing ones and create new ones
    for (const item of entry.items) {
      if (item.id.toString().startsWith('temp-')) {
        // This is a new item, create it
        const newItemData = {
          entry_id: entryId,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          purchase_price: item.purchasePrice,
          discount_percent: item.discountPercent || 0
        };
        
        const { error: newItemError } = await supabase
          .from('stock_entry_items')
          .insert(newItemData);
        
        if (newItemError) {
          console.error("Error creating new item:", newItemError);
          throw new Error(`Erro ao adicionar item: ${item.productName}`);
        }
      } else {
        // This is an existing item, update it
        const updateItemData = {
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          purchase_price: item.purchasePrice,
          discount_percent: item.discountPercent || 0
        };
        
        const { error: updateItemError } = await supabase
          .from('stock_entry_items')
          .update(updateItemData)
          .eq('id', item.id);
        
        if (updateItemError) {
          console.error("Error updating item:", updateItemError);
          throw new Error(`Erro ao atualizar item: ${item.productName}`);
        }
      }
    }
    
    // Delete any items that were removed
    const originalItems = stockEntries?.find(e => e.id === entryId)?.items || [];
    const keepItemIds = entry.items.filter(item => !item.id.toString().startsWith('temp-')).map(item => item.id);
    const itemsToDelete = originalItems.filter((item: StockEntryItem) => !keepItemIds.includes(item.id));
    
    for (const item of itemsToDelete) {
      const { error: deleteError } = await supabase
        .from('stock_entry_items')
        .delete()
        .eq('id', item.id);
      
      if (deleteError) {
        console.error("Error deleting item:", deleteError);
        throw new Error(`Erro ao remover item: ${item.productName}`);
      }
    }
  };

  const createNewEntry = async (supplier: any) => {
    // Generate a new entry number (this would typically come from a sequence or counter)
    // We'll use the get_next_counter database function
    const { data: counterData, error: counterError } = await supabase
      .rpc('get_next_counter', { counter_id: 'stock_entry' });
      
    if (counterError) {
      console.error("Error generating entry number:", counterError);
      throw new Error("Erro ao gerar número da entrada");
    }
    
    const entryNumber = counterData || `${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    const entryData = {
      supplier_id: entry.supplierId,
      supplier_name: supplier.name,
      date: entry.date,
      invoice_number: entry.invoiceNumber,
      notes: entry.notes,
      number: entryNumber
    };
    
    // Add user_id to the entry data for RLS
    const securedEntryData = await withUserData(entryData);
    
    const { data: entryData2, error: entryError } = await supabase
      .from('stock_entries')
      .insert(securedEntryData)
      .select('id')
      .single();
    
    if (entryError || !entryData2) {
      console.error("Error creating stock entry:", entryError);
      throw new Error("Erro ao criar entrada de stock");
    }
    
    // Now create the items
    for (const item of entry.items) {
      const newItemData = {
        entry_id: entryData2.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        discount_percent: item.discountPercent || 0
      };
      
      const { error: itemError } = await supabase
        .from('stock_entry_items')
        .insert(newItemData);
      
      if (itemError) {
        console.error("Error creating item:", itemError);
        throw new Error(`Erro ao adicionar item: ${item.productName}`);
      }
    }
  };

  return { handleSubmit, isSubmitting, isNewEntry };
};
