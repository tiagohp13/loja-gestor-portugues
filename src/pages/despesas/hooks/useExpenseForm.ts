
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Supplier, ExpenseItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface ExpenseFormData {
  supplierId: string;
  supplierName: string;
  date: string;
  notes: string;
  items: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>[];
}

export const useExpenseForm = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedSuppliers: Supplier[] = data.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          taxId: supplier.tax_id || '',
          paymentTerms: supplier.payment_terms || '',
          notes: supplier.notes || '',
          createdAt: supplier.created_at,
          updatedAt: supplier.updated_at,
          status: supplier.status
        }));
        setSuppliers(formattedSuppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Erro ao carregar fornecedores');
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setFormData({
      ...formData,
      supplierId,
      supplierName: supplier?.name || ''
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productName: '',
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: keyof Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discountPercent / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      toast.error('Por favor selecione um fornecedor');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Por favor adicione pelo menos um item');
      return;
    }

    if (formData.items.some(item => !item.productName.trim())) {
      toast.error('Por favor preencha o nome de todos os produtos');
      return;
    }

    try {
      setIsLoading(true);

      // Get next expense number
      const currentYear = new Date().getFullYear();
      const { data: numberData, error: numberError } = await supabase
        .rpc('get_next_counter_by_year', { counter_type: 'expenses', p_year: currentYear });

      if (numberError) throw numberError;

      const expenseNumber = `DESP-${currentYear}/${String(numberData || 1).padStart(3, '0')}`;

      // Create expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          number: expenseNumber,
          supplier_id: formData.supplierId,
          supplier_name: formData.supplierName,
          date: formData.date,
          notes: formData.notes
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense items
      const itemsToInsert = formData.items.map(item => ({
        expense_id: expenseData.id,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent
      }));

      const { error: itemsError } = await supabase
        .from('expense_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('Despesa criada com sucesso');
      navigate('/despesas/historico');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Erro ao criar despesa');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<ExpenseFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    suppliers,
    formData,
    isLoading,
    handleSupplierChange,
    addItem,
    removeItem,
    updateItem,
    calculateTotal,
    handleSubmit,
    updateFormData,
    navigate
  };
};
