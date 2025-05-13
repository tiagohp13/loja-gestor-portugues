
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { toast } from 'sonner';
import { StockEntryItem } from '@/types';

export const useStockEntryForm = () => {
  const navigate = useNavigate();
  const { addStockEntry, products, suppliers } = useData();
  
  const [entryDetails, setEntryDetails] = useState({
    supplierId: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });
  
  const [items, setItems] = useState<StockEntryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
  }>({
    productId: '',
    productName: '',
    quantity: 1,
    purchasePrice: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleEntryDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' 
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSupplierSearch = (value: string) => {
    setSupplierSearchTerm(value);
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setCurrentItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        purchasePrice: selectedProduct.purchasePrice
      });
      setSelectedProductDisplay(`${selectedProduct.code} - ${selectedProduct.name}`);
    }
    setIsProductSearchOpen(false);
  };
  
  const handleSupplierSelect = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    setEntryDetails(prev => ({
      ...prev,
      supplierId,
      supplierName: selectedSupplier?.name || ''
    }));
    setIsSupplierSearchOpen(false);
  };
  
  const addItemToEntry = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Selecione um produto e uma quantidade válida');
      return;
    }
    
    const existingItemIndex = items.findIndex(item => item.productId === currentItem.productId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + currentItem.quantity,
        purchasePrice: currentItem.purchasePrice
      };
      setItems(updatedItems);
    } else {
      setItems([...items, { 
        id: crypto.randomUUID(),
        ...currentItem 
      }]);
    }
    
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      purchasePrice: 0
    });
    setSelectedProductDisplay('');
    setSearchTerm('');
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const filteredSuppliers = supplierSearchTerm
    ? suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      )
    : suppliers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entryDetails.supplierId || items.length === 0) {
      toast.error('Selecione um fornecedor e adicione pelo menos um produto');
      return;
    }
    
    const supplier = suppliers.find(s => s.id === entryDetails.supplierId);
    
    if (!supplier) {
      toast.error('Fornecedor não encontrado');
      return;
    }
    
    const loadingToast = toast.loading('Registando entrada...');
    
    try {
      await addStockEntry({
        supplierId: entryDetails.supplierId,
        supplierName: supplier.name,
        items: items,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber,
        notes: entryDetails.notes
      });
      
      toast.dismiss(loadingToast);
      toast.success('Entrada registada com sucesso');
      navigate('/entradas/historico');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro ao registar entrada:", error);
      toast.error('Erro ao registar entrada');
    }
  };

  const totalValue = items.reduce((total, item) => 
    total + (item.quantity * item.purchasePrice), 0);

  return {
    entryDetails,
    items,
    currentItem,
    searchTerm,
    selectedProductDisplay,
    isProductSearchOpen,
    isSupplierSearchOpen,
    supplierSearchTerm,
    entryDate,
    calendarOpen,
    filteredProducts,
    filteredSuppliers,
    totalValue,
    setEntryDetails,
    setCurrentItem,
    setSearchTerm,
    setSelectedProductDisplay,
    setIsProductSearchOpen,
    setIsSupplierSearchOpen,
    setSupplierSearchTerm,
    setCalendarOpen,
    setEntryDate,
    handleEntryDetailsChange,
    handleItemChange,
    handleSearch,
    handleSupplierSearch,
    handleProductSelect,
    handleSupplierSelect,
    addItemToEntry,
    removeItem,
    handleSubmit
  };
};
