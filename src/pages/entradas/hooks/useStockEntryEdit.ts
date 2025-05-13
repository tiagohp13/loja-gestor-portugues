import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StockEntryItem } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useStockEntryEdit = (id?: string) => {
  const navigate = useNavigate();
  const { stockEntries, updateStockEntry, products, suppliers } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [entry, setEntry] = useState({
    supplierId: '',
    items: [] as StockEntryItem[],
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });

  const isNewEntry = !id;

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

  const handleSupplierChange = (value: string) => {
    setEntry(prev => ({
      ...prev,
      supplierId: value
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

    setIsSubmitting(true);

    try {
      // Get the supplier associated with this entry
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      
      if (!supplier) {
        toast.error('Fornecedor não encontrado');
        setIsSubmitting(false);
        return;
      }
      
      if (id) {
        // Update the stock entry
        // Fix: Get the existing entry to get its 'number' field
        const existingEntry = stockEntries.find(e => e.id === id);
        
        if (!existingEntry) {
          toast.error('Entrada não encontrada');
          setIsSubmitting(false);
          return;
        }
        
        const { error: entryError } = await supabase
          .from('stock_entries')
          .update({
            supplier_id: entry.supplierId,
            supplier_name: supplier.name,
            date: entry.date,
            invoice_number: entry.invoiceNumber,
            notes: entry.notes,
            // Include the number field from the existing entry
            number: existingEntry.number
          })
          .eq('id', id);
        
        if (entryError) {
          console.error("Error updating stock entry:", entryError);
          toast.error("Erro ao atualizar entrada de stock");
          setIsSubmitting(false);
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
      } else {
        // This is a new entry, create it
        // Generate a new entry number (this would typically come from a sequence or counter)
        // We'll use the get_next_counter database function
        const { data: counterData, error: counterError } = await supabase
          .rpc('get_next_counter', { counter_id: 'stock_entries' });
          
        if (counterError) {
          console.error("Error generating entry number:", counterError);
          toast.error("Erro ao gerar número da entrada");
          setIsSubmitting(false);
          return;
        }
        
        const entryNumber = counterData || `${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

        const { data: entryData, error: entryError } = await supabase
          .from('stock_entries')
          .insert({
            supplier_id: entry.supplierId,
            supplier_name: supplier.name,
            date: entry.date,
            invoice_number: entry.invoiceNumber,
            notes: entry.notes,
            number: entryNumber // Include the generated number
          })
          .select('id')
          .single();
        
        if (entryError || !entryData) {
          console.error("Error creating stock entry:", entryError);
          toast.error("Erro ao criar entrada de stock");
          setIsSubmitting(false);
          return;
        }
        
        // Now create the items
        for (const item of entry.items) {
          const { error: itemError } = await supabase
            .from('stock_entry_items')
            .insert({
              entry_id: entryData.id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              purchase_price: item.purchasePrice,
              discount_percent: item.discountPercent || 0
            });
          
          if (itemError) {
            console.error("Error creating item:", itemError);
            toast.error(`Erro ao adicionar item: ${item.productName}`);
          }
        }
        
        toast.success('Entrada criada com sucesso');
      }
      
      navigate('/entradas/historico');
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Erro ao salvar entrada de stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateItemTotal = (item: StockEntryItem) => {
    return item.quantity * item.purchasePrice;
  };

  const calculateTotal = () => {
    return entry.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  return {
    entry,
    isNewEntry,
    isSubmitting,
    handleChange,
    handleSupplierChange,
    handleItemChange,
    addNewItem,
    removeItem,
    handleSubmit,
    calculateItemTotal,
    calculateTotal
  };
};
