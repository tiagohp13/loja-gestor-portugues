
import { useState, useEffect } from 'react';
import { StockEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStockEntries = () => {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<StockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = entries.filter(entry =>
        entry.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(entries);
    }
  }, [searchTerm, entries]);

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'number':
        aValue = a.number;
        bValue = b.number;
        break;
      case 'supplier':
        aValue = a.supplierName;
        bValue = b.supplierName;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== id));
      setFilteredEntries(filteredEntries.filter(entry => entry.id !== id));
      toast.success('Entrada de stock eliminada com sucesso');
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      toast.error('Erro ao eliminar entrada de stock');
    }
  };

  const calculateEntryTotal = (entry: StockEntry) => {
    return entry.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.purchasePrice;
      const discount = item.discountPercent ? (itemTotal * item.discountPercent / 100) : 0;
      return sum + (itemTotal - discount);
    }, 0);
  };

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      
      const { data: entriesData, error: entriesError } = await supabase
        .from('stock_entries')
        .select(`
          *,
          stock_entry_items(*)
        `)
        .order('created_at', { ascending: false });

      if (entriesError) throw entriesError;

      if (entriesData) {
        const formattedEntries: StockEntry[] = entriesData.map(entry => ({
          id: entry.id,
          supplierId: entry.supplier_id || '',
          supplierName: entry.supplier_name,
          number: entry.number,
          invoiceNumber: entry.invoice_number || '',
          notes: entry.notes || '',
          date: entry.date,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at || entry.created_at,
          items: (entry.stock_entry_items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            quantity: item.quantity,
            purchasePrice: Number(item.purchase_price),
            discountPercent: item.discount_percent ? Number(item.discount_percent) : undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          })),
          total: (entry.stock_entry_items || []).reduce((sum: number, item: any) => {
            const itemTotal = item.quantity * Number(item.purchase_price);
            const itemDiscount = Number(item.discount_percent || 0);
            const discountAmount = itemTotal * (itemDiscount / 100);
            return sum + (itemTotal - discountAmount);
          }, 0)
        }));

        setEntries(formattedEntries);
        setFilteredEntries(formattedEntries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Erro ao carregar entradas de stock');
    } finally {
      setIsLoading(false);
    }
  };

  const createEntry = async (entry: Omit<StockEntry, 'number' | 'id' | 'createdAt' | 'updatedAt' | 'total'>): Promise<StockEntry> => {
    try {
      const { data: numberData, error: numberError } = await supabase
        .rpc('get_next_counter', { counter_id: 'stock_entry' });

      if (numberError) throw numberError;

      const entryNumber = numberData || `ENT-${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('stock_entries')
        .insert({
          number: entryNumber,
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes,
          date: entry.date
        })
        .select()
        .single();

      if (error) throw error;

      const createdEntry: StockEntry = {
        id: data.id,
        number: data.number,
        supplierId: data.supplier_id || '',
        supplierName: data.supplier_name,
        invoiceNumber: data.invoice_number || '',
        notes: data.notes || '',
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: [],
        total: 0
      };

      setEntries([createdEntry, ...entries]);
      setFilteredEntries([createdEntry, ...filteredEntries]);
      toast.success('Entrada de stock criada com sucesso');

      return createdEntry;
    } catch (error) {
      console.error('Error creating stock entry:', error);
      toast.error('Erro ao criar entrada de stock');
      throw error;
    }
  };

  const updateEntry = async (entry: StockEntry): Promise<StockEntry> => {
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .update({
          supplier_id: entry.supplierId,
          supplier_name: entry.supplierName,
          invoice_number: entry.invoiceNumber,
          notes: entry.notes,
          date: entry.date
        })
        .eq('id', entry.id)
        .select()
        .single();

      if (error) throw error;

      const updatedEntry: StockEntry = {
        id: data.id,
        number: data.number,
        supplierId: data.supplier_id || '',
        supplierName: data.supplier_name,
        invoiceNumber: data.invoice_number || '',
        notes: data.notes || '',
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: [],
        total: 0
      };

      setEntries(entries.map(e => (e.id === entry.id ? updatedEntry : e)));
      setFilteredEntries(filteredEntries.map(e => (e.id === entry.id ? updatedEntry : e)));
      toast.success('Entrada de stock atualizada com sucesso');

      return updatedEntry;
    } catch (error) {
      console.error('Error updating stock entry:', error);
      toast.error('Erro ao atualizar entrada de stock');
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    return handleDeleteEntry(id);
  };

  return {
    entries,
    filteredEntries,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    sortField,
    sortOrder,
    sortedEntries,
    handleSortChange,
    handleDeleteEntry,
    calculateEntryTotal,
    localEntries: entries
  };
};
