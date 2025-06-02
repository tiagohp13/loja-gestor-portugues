
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { supabase, addToDeletedCache, filterDeletedItems } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StockEntry } from '@/types';

type SortField = 'number' | 'date' | 'supplierName' | 'invoiceNumber' | 'value';
type SortOrder = 'asc' | 'desc';

export const useStockEntries = () => {
  const { stockEntries, deleteStockEntry, setStockEntries } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [localEntries, setLocalEntries] = useState<StockEntry[]>([]);

  const calculateEntryTotal = (entry: StockEntry) => {
    return entry.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  };

  const fetchAllEntries = async () => {
    try {
      console.log("Fetching stock entries...");
      
      const { data, error } = await supabase
        .from('stock_entries')
        .select(`
          *,
          stock_entry_items(*)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching stock entries:", error);
        toast.error("Erro ao carregar entradas de stock");
        return;
      }

      if (data) {
        console.log("Stock entries data received:", data);
        
        const mappedEntries = data.map(entry => ({
          id: entry.id,
          supplierId: entry.supplier_id,
          supplierName: entry.supplier_name,
          number: entry.number,
          invoiceNumber: entry.invoice_number,
          notes: entry.notes,
          date: entry.date,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at || entry.created_at,
          items: entry.stock_entry_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            purchasePrice: item.purchase_price,
            discountPercent: item.discount_percent,
            createdAt: item.created_at,
            updatedAt: item.updated_at || item.created_at
          }))
        }));
        
        const filteredEntries = filterDeletedItems('stock_entries', mappedEntries);
        
        setLocalEntries(filteredEntries);
        setStockEntries(filteredEntries);
        console.log("Updated local entries:", filteredEntries.length);
      }
    } catch (error) {
      console.error("Error in fetchEntries:", error);
      toast.error("Erro ao carregar entradas de stock");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAllEntries();
  }, [setStockEntries]);

  useEffect(() => {
    console.log("Setting up realtime subscriptions for stock entries");
    
    // Create a dedicated channel for entries
    const entriesChannel = supabase.channel('stock_entries_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_entries' }, 
        (payload) => {
          console.log('Stock entry change detected:', payload);
          
          if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = payload.old.id;
            console.log('Handling delete for entry:', deletedId);
            addToDeletedCache('stock_entries', deletedId);
            
            setLocalEntries(prev => prev.filter(entry => entry.id !== deletedId));
            setStockEntries(prev => prev.filter(entry => entry.id !== deletedId));
            return;
          }
          
          // For inserts and updates, refresh the entire list
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            console.log('Handling insert/update, refreshing entries list');
            fetchAllEntries();
          }
        }
      )
      .subscribe((status) => {
        console.log('Stock entries subscription status:', status);
      });
      
    // Create a dedicated channel for entry items
    const itemsChannel = supabase.channel('stock_entry_items_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_entry_items' }, 
        (payload) => {
          console.log('Stock entry item change detected:', payload);
          console.log('Refreshing entries list due to item changes');
          fetchAllEntries();
        }
      )
      .subscribe((status) => {
        console.log('Stock entry items subscription status:', status);
      });
    
    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(entriesChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [setStockEntries]);

  // Filter entries based on search term
  const filteredEntries = localEntries.filter(entry => 
    entry.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.invoiceNumber && entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort entries based on sort field and order
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortField === 'number') {
      return sortOrder === 'asc' 
        ? a.number.localeCompare(b.number) 
        : b.number.localeCompare(a.number);
    }
    
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === 'supplierName') {
      return sortOrder === 'asc' 
        ? (a.supplierName || '').localeCompare(b.supplierName || '') 
        : (b.supplierName || '').localeCompare(a.supplierName || '');
    }
    
    if (sortField === 'invoiceNumber') {
      return sortOrder === 'asc' 
        ? (a.invoiceNumber || '').localeCompare(b.invoiceNumber || '') 
        : (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '');
    }
    
    if (sortField === 'value') {
      const valueA = calculateEntryTotal(a);
      const valueB = calculateEntryTotal(b);
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    return 0;
  });

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking on the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending order
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      addToDeletedCache('stock_entries', id);
      
      setLocalEntries(prev => prev.filter(entry => entry.id !== id));
      
      await deleteStockEntry(id);
      
      toast.success("Compra eliminada com sucesso");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Erro ao eliminar compra");
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    isLoading,
    sortedEntries,
    handleSortChange,
    handleDeleteEntry,
    calculateEntryTotal,
    localEntries
  };
};
