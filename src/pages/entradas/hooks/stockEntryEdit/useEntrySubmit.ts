// src/pages/entradas/hooks/stockEntryEdit/useEntrySubmit.ts

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

  const { suppliers, stockEntries } = window;

  const validateForm = (): boolean => {
    if (entry.items.length === 0) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um produto à entrada', variant: 'destructive' });
      return false;
    }
    if (!entry.supplierId) {
      toast({ title: 'Erro', description: 'Selecione um fornecedor', variant: 'destructive' });
      return false;
    }
    if (entry.items.some(item => !item.productId)) {
      toast({ title: 'Erro', description: 'Selecione um produto para todos os itens', variant: 'destructive' });
      return false;
    }
    if (entry.items.some(item => item.quantity <= 0)) {
      toast({ title: 'Erro', description: 'A quantidade deve ser maior que zero', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const supplier = (suppliers as any[])?.find(s => s.id === entry.supplierId);
      if (!supplier) throw new Error('Fornecedor não encontrado');

      if (id) {
        await updateExistingEntry(id, supplier);
        toast({ title: 'Sucesso', description: 'Entrada atualizada com sucesso' });
      } else {
        await createNewEntry(supplier);
        toast({ title: 'Sucesso', description: 'Entrada criada com sucesso' });
      }

      navigate('/entradas/historico');
    } catch (error: any) {
      console.error('Erro no submit:', error);
      toast({ title: 'Erro', description: error.message || 'Erro ao salvar entrada', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateExistingEntry = async (entryId: string, supplier: any) => {
    const existing = (stockEntries as any[])?.find(e => e.id === entryId);
    if (!existing) throw new Error('Entrada não encontrada');

    const entryData = {
      supplier_id: entry.supplierId,
      supplier_name: supplier.name,
      date: entry.date,
      invoice_number: entry.invoiceNumber,
      notes: entry.notes,
      number: existing.number
    };
    const secured = await withUserData(entryData);
    const { error: eError } = await supabase
      .from('stock_entries')
      .update(secured)
      .eq('id', entryId);
    if (eError) throw new Error('Erro ao atualizar entrada');

    // IDs originais para comparação (converte string ou number para number)
    const originalItems: StockEntryItem[] = existing.items || [];
    const originalIds: number[] = originalItems.map(i => Number(i.id));

    // Upsert de itens
    for (const item of entry.items) {
      if (item.id == null) {
        const newItem = {
          entry_id: entryId,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          purchase_price: item.purchasePrice,
          discount_percent: item.discountPercent || 0
        };
        const { error: niError } = await supabase
          .from('stock_entry_items')
          .insert(newItem);
        if (niError) throw new Error(`Erro ao adicionar item ${item.productName}`);
      } else {
        const upd = {
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          purchase_price: item.purchasePrice,
          discount_percent: item.discountPercent || 0
        };
        const { error: uiError } = await supabase
          .from('stock_entry_items')
          .update(upd)
          .eq('id', item.id);
        if (uiError) throw new Error(`Erro ao atualizar item ${item.productName}`);
      }
    }

    // Deletar itens removidos pelo usuário
    const keepIds: number[] = entry.items
      .filter(i => i.id != null)
      .map(i => Number(i.id));
    const deleteIds: number[] = originalIds.filter(oid => !keepIds.includes(oid));
    if (deleteIds.length) {
      const { error: dError } = await supabase
        .from('stock_entry_items')
        .delete()
        .in('id', deleteIds.map(id => id.toString())); // converte para string[]
      if (dError) throw new Error('Erro ao remover itens deletados');
    }
  };

  const createNewEntry = async (supplier: any) => {
    const { data: counterData, error: counterError } = await supabase
      .rpc('get_next_counter', { counter_id: 'stock_entry' });
    if (counterError) throw new Error('Erro ao gerar número da entrada');

    const entryNumber = counterData ||
      `${new Date().getFullYear()}/${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    const entryData = {
      supplier_id: entry.supplierId,
      supplier_name: supplier.name,
      date: entry.date,
      invoice_number: entry.invoiceNumber,
      notes: entry.notes,
      number: entryNumber
    };
    const securedEntryData = await withUserData(entryData);
    const { data: newEntry, error: entryError } = await supabase
      .from('stock_entries')
      .insert(securedEntryData)
      .select('id')
      .single();
    if (entryError || !newEntry) throw new Error('Erro ao criar entrada de stock');

    for (const item of entry.items) {
      const newItem = {
        entry_id: newEntry.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        discount_percent: item.discountPercent || 0
      };
      const { error: itemError } = await supabase
        .from('stock_entry_items')
        .insert(newItem);
      if (itemError) throw new Error(`Erro ao adicionar item: ${item.productName}`);
    }
  };

  return { handleSubmit, isSubmitting, isNewEntry };
};
