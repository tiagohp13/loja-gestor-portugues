
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StockExitItem, StockExit } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export const useStockExit = (exitId?: string) => {
  const navigate = useNavigate();
  const { clients, products, stockExits, addStockExit, updateStockExit } = useData();
  
  const initialExitDetails = {
    clientId: '',
    clientName: '',
    invoiceNumber: '',
    notes: '',
    discount: 0,
  };
  
  const [exitDetails, setExitDetails] = useState(initialExitDetails);
  const [items, setItems] = useState<StockExitItem[]>([]);
  const [currentItem, setCurrentItem] = useState<StockExitItem>({
    id: '',
    productId: '',
    productName: '',
    quantity: 1,
    salePrice: 0,
    discountPercent: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedProductDisplay, setSelectedProductDisplay] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  const [exitDate, setExitDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Load exit data if in edit mode
  useEffect(() => {
    if (exitId) {
      const exitData = stockExits.find(exit => exit.id === exitId);
      
      if (exitData) {
        setExitDetails({
          clientId: exitData.clientId || '',
          clientName: exitData.clientName || '',
          invoiceNumber: exitData.invoiceNumber || '',
          notes: exitData.notes || '',
          discount: exitData.discount || 0,
        });
        
        setItems(exitData.items || []);
        setExitDate(new Date(exitData.date));
      }
    }
  }, [exitId, stockExits]);
  
  // Filter products based on search term
  const filteredProducts = searchTerm.trim() === '' ? 
    products :
    products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  // Filter clients based on search term
  const filteredClients = clientSearchTerm.trim() === '' ?
    clients :
    clients.filter(client =>
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.taxId?.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  
  const handleExitDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExitDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
  };
  
  const handleProductSelect = (product: any) => {
    setCurrentItem({
      id: '',
      productId: product.id,
      productName: product.name,
      quantity: 1,
      salePrice: product.salePrice,
      discountPercent: 0
    });
    
    setSelectedProductDisplay(product.name);
    setSearchTerm('');
    setIsProductSearchOpen(false);
  };
  
  const handleClientSelect = (client: any) => {
    setExitDetails(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name
    }));
    
    setClientSearchTerm('');
    setIsClientSearchOpen(false);
  };
  
  const addItemToExit = () => {
    if (!currentItem.productId) {
      toast({ title: "Erro", description: "Selecione um produto" });
      return;
    }
    
    if (currentItem.quantity <= 0) {
      toast({ title: "Erro", description: "A quantidade deve ser maior que zero" });
      return;
    }
    
    if (currentItem.salePrice < 0) {
      toast({ title: "Erro", description: "O preço não pode ser negativo" });
      return;
    }
    
    setItems(prevItems => [...prevItems, { ...currentItem, id: uuidv4() }]);
    
    setCurrentItem({
      id: '',
      productId: '',
      productName: '',
      quantity: 1,
      salePrice: 0,
      discountPercent: 0
    });
    
    setSelectedProductDisplay('');
  };
  
  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, updatedItem: StockExitItem) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = updatedItem;
      return newItems;
    });
  };
  
  const getDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent) return price;
    return price * (1 - (discountPercent / 100));
  };
  
  const totalValue = items.reduce((sum, item) => {
    const discountedPrice = getDiscountedPrice(item.salePrice, item.discountPercent);
    return sum + (item.quantity * discountedPrice);
  }, 0);
  
  const handleSubmit = async () => {
    if (!exitDetails.clientId) {
      toast({ title: "Erro", description: "Selecione um cliente" });
      return;
    }
    
    if (items.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos um produto" });
      return;
    }
    
    try {
      const exitData: Omit<StockExit, "number" | "id" | "createdAt"> = {
        clientId: exitDetails.clientId,
        clientName: exitDetails.clientName,
        date: exitDate.toISOString().split('T')[0],
        invoiceNumber: exitDetails.invoiceNumber || undefined,
        notes: exitDetails.notes,
        discount: exitDetails.discount,
        items,
        fromOrderId: undefined,
        fromOrderNumber: undefined,
        updated_at: new Date().toISOString()
      };
      
      if (exitId) {
        await updateStockExit(exitId, exitData);
        toast({ title: "Sucesso", description: "Venda atualizada com sucesso" });
      } else {
        await addStockExit(exitData);
        toast({ title: "Sucesso", description: "Venda criada com sucesso" });
      }
      
      navigate('/saidas/historico');
    } catch (error) {
      console.error("Error saving stock exit:", error);
      toast({ 
        title: "Erro", 
        description: "Ocorreu um erro ao salvar a venda",
        variant: "destructive"
      });
    }
  };
  
  const selectedClient = clients.find(c => c.id === exitDetails.clientId);
  
  return {
    exitDetails,
    items,
    currentItem,
    setCurrentItem,
    searchTerm,
    setSearchTerm,
    selectedProductDisplay,
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
    updateItem,
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
