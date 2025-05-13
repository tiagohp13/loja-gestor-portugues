
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StockExitItem, Product, Client } from '@/types';
import { toast } from 'sonner';

export const useStockExit = () => {
  const navigate = useNavigate();
  const { addStockExit, products, clients } = useData();
  
  const [exitDetails, setExitDetails] = useState({
    clientId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    notes: ''
  });
  
  const [items, setItems] = useState<StockExitItem[]>([]);
  
  const [currentItem, setCurrentItem] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    salePrice: number;
    discountPercent: number;
  }>({
    productId: '',
    productName: '',
    quantity: 1,
    salePrice: 0,
    discountPercent: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [exitDate, setExitDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleExitDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExitDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setCurrentItem({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        salePrice: selectedProduct.salePrice,
        discountPercent: 0
      });
      setSelectedProductDisplay(`${selectedProduct.code} - ${selectedProduct.name}`);
    }
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setExitDetails(prev => ({
      ...prev,
      clientId,
      clientName: selectedClient?.name || ''
    }));
    setIsClientSearchOpen(false);
  };
  
  const addItemToExit = () => {
    if (!currentItem.productId || currentItem.quantity <= 0) {
      toast.error('Selecione um produto e uma quantidade válida');
      return;
    }
    
    const product = products.find(p => p.id === currentItem.productId);
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }
    
    if (product.currentStock < currentItem.quantity) {
      toast.error(`Stock insuficiente. Disponível: ${product.currentStock} unidades`);
      return;
    }
    
    // Always add as a new line item, not checking for existing items
    setItems([...items, { 
      id: crypto.randomUUID(),
      ...currentItem 
    }]);
    
    setCurrentItem({
      productId: '',
      productName: '',
      quantity: 1,
      salePrice: 0,
      discountPercent: 0
    });
    setSelectedProductDisplay('');
    setSearchTerm('');
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getDiscountedPrice = (price: number, discountPercent: number) => {
    if (!discountPercent) return price;
    return price * (1 - discountPercent / 100);
  };

  const totalValue = items.reduce((total, item) => 
    total + (item.quantity * getDiscountedPrice(item.salePrice, item.discountPercent || 0)), 0);

  const filteredProducts = searchTerm
    ? products.filter(product => 
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
        product.currentStock > 0
      )
    : products.filter(product => product.currentStock > 0);

  const filteredClients = clientSearchTerm
    ? clients.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
      )
    : clients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exitDetails.clientId || items.length === 0) {
      toast.error('Selecione um cliente e adicione pelo menos um produto');
      return;
    }
    
    const client = clients.find(c => c.id === exitDetails.clientId);
    
    if (!client) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    // Verify stock again before submission
    let hasEnoughStock = true;
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.currentStock < item.quantity) {
        hasEnoughStock = false;
        toast.error(`Stock insuficiente para ${item.productName}. Disponível: ${product?.currentStock || 0} unidades`);
      }
    });
    
    if (!hasEnoughStock) return;
    
    const loadingToast = toast.loading('Registando venda...');
    
    try {
      await addStockExit({
        clientId: exitDetails.clientId,
        clientName: client.name,
        items: items,
        date: exitDate.toISOString(),
        invoiceNumber: exitDetails.invoiceNumber,
        notes: exitDetails.notes
      });
      
      toast.dismiss(loadingToast);
      toast.success('Venda registada com sucesso');
      navigate('/saidas/historico');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro ao registar venda:", error);
      toast.error('Erro ao registar venda');
    }
  };

  const selectedClient = clients.find(c => c.id === exitDetails.clientId);

  return {
    exitDetails,
    setExitDetails,
    items,
    setItems,
    currentItem,
    setCurrentItem,
    searchTerm,
    setSearchTerm,
    selectedProductDisplay,
    setSelectedProductDisplay,
    isProductSearchOpen,
    setIsProductSearchOpen,
    clientSearchTerm,
    setClientSearchTerm,
    isClientSearchOpen,
    setIsClientSearchOpen,
    exitDate,
    setExitDate,
    calendarOpen,
    setCalendarOpen,
    handleExitDetailsChange,
    handleSearch,
    handleClientSearch,
    handleProductSelect,
    handleClientSelect,
    addItemToExit,
    removeItem,
    getDiscountedPrice,
    totalValue,
    filteredProducts,
    filteredClients,
    handleSubmit,
    selectedClient,
    products,
    navigate
  };
};
