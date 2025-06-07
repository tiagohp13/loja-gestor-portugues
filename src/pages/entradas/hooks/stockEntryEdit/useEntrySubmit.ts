// src/pages/compras/entradas/hooks/stockEntryEdit/useEntrySubmit.ts

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

  // esses arrays vêm do DataContext via window
  const { suppliers, stockEntries } = window;

  const validateForm = () => {
    if (entry.items.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos um produto à entrada", variant: "destructive" });
      return false;
    }
    if (!entry.supplierId) {
      toast({ title: "Erro", description: "Selecione um fornecedor", variant: "destructive" });
      return false;
    }
    if (entry.items.some(item => !item.productId)) {
      toast({ title: "Erro", description: "Selecione um produto para todos os itens", variant: "destructive" });
      return false;
    }
    if (entry.items.some(item => item.quantity <= 0)) {
      toast({ title: "Erro", description: "A quantidade deve ser maior que zero", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      if (!supplier) throw new Error('Fornecedor não encontrado');

      if (id) {
        await updateExistingEntry(id, supplier);
        toast({ title: "Sucesso", description: "Entrada atualizada com sucesso" });
      } else {
        await createNewEntry(supplier);
        toast({ title: "Sucesso", description: "Entrada criada com sucesso" });
      }

      navigate('/entradas/historico');
    } catch (error) {
      console.error("Erro no submit:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao salvar entrada",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateExistingEntry = async (entryId: string, supplier: any) => {
    // Atualiza dados principais
    const existing = stockEntries?.find(e => e.id === entryId);
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

    // IDs originais para comparação
    const originalItems: StockEntryItem[] = existing.items || [];
    const originalIds = originalItems.map(i => i.id);

    // Upsert de itens
    for (const item of entry.items) {
      // Novo se não possuir id
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
        // Update existente
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
    const keepIds = entry.items
      .filter(i => i.id != null)
      .map(i => i.id as number);
    const deleteIds = originalIds.filter(oid => !keepIds.includes(oid));
    if (deleteIds.length) {
      const { error: dError } = await supabase
        .from('stock_entry_items')
        .delete()
        .in('id', deleteIds);
      if (dError) throw new Error('Erro ao remover itens deletados');
    }
  };

  const createNewEntry = async (supplier: any) => {
    // lógica de criação...
    // (mantenha igual à sua versão anterior)
  };

  return { handleSubmit, isSubmitting, isNewEntry };
};
