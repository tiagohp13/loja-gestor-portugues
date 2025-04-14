import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useData } from '@/contexts/DataContext';
import { Product, StockEntryItem, Supplier } from '@/types';
import { toast } from 'sonner';

interface EntryDetails {
  supplierId: string;
  invoiceNumber: string;
  notes: string;
}

const StockEntryNew = () => {
  const navigate = useNavigate();
  const { products, suppliers, addStockEntry, createStockEntry } = useData();
  const [items, setItems] = useState<StockEntryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [entryDetails, setEntryDetails] = useState<EntryDetails>({
    supplierId: '',
    invoiceNumber: '',
    notes: '',
  });
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
  }));
  
  const handleSupplierSelect = (option: { value: string, label: string } | null) => {
    if (option) {
      const supplier = suppliers.find(s => s.id === option.value) || null;
      setSelectedSupplier(supplier);
      setEntryDetails(prev => ({ ...prev, supplierId: option.value }));
    }
  };
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddProduct = () => {
    if (selectedProduct) {
      const newItem: StockEntryItem = {
        id: crypto.randomUUID(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        purchasePrice: purchasePrice,
        discountPercent: discountPercent
      };
      setItems([...items, newItem]);
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
      setPurchasePrice(0);
      setDiscountPercent(0);
    }
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : value);
  };
  
  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPurchasePrice(isNaN(value) ? 0 : value);
  };
  
  const handleDiscountPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDiscountPercent(isNaN(value) ? 0 : value);
  };
  
  const handleEntryDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto à entrada');
      return;
    }
    
    try {
      const loadingToast = toast.loading('A guardar entrada de stock...');
      
      await createStockEntry({
        supplierId: entryDetails.supplierId,
        supplierName: selectedSupplier?.name || '',
        items: items,
        date: entryDate.toISOString(),
        invoiceNumber: entryDetails.invoiceNumber,
        notes: entryDetails.notes,
        type: 'purchase' as 'purchase' | 'consumption'
      });
      
      toast.dismiss(loadingToast);
      toast.success('Entrada de stock guardada com sucesso');
      
      navigate('/entradas/historico');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Erro ao guardar entrada de stock');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Button onClick={() => navigate('/entradas/historico')}>Voltar</Button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Nova Entrada de Stock</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Select
              options={supplierOptions}
              onChange={handleSupplierSelect}
              placeholder="Selecionar Fornecedor"
            />
          </div>
          <div>
            <Label>Data da Entrada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !entryDate && "text-muted-foreground"
                  )}
                >
                  {entryDate ? format(entryDate, "dd/MM/yyyy", { locale: pt }) : (
                    <span>Escolher Data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="single"
                  locale={pt}
                  selected={entryDate}
                  onSelect={setEntryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="invoiceNumber">Número da Fatura</Label>
            <Input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              value={entryDetails.invoiceNumber}
              onChange={handleEntryDetailsChange}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={entryDetails.notes}
              onChange={handleEntryDetailsChange}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Adicionar Produto</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-2/5">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gestorApp-gray" />
              <Input
                className="pl-10"
                placeholder="Pesquisar produto por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchTerm('')}
              />
              {searchTerm && (
                <div className="absolute z-10 bg-white border rounded-md shadow-md mt-1 w-full">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchTerm(product.name);
                        }}
                      >
                        {product.name} ({product.code})
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Nenhum produto encontrado.</div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full md:w-1/5">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            <div className="w-full md:w-1/5">
              <Label htmlFor="purchasePrice">Preço Compra</Label>
              <Input
                type="number"
                id="purchasePrice"
                value={purchasePrice}
                onChange={handlePurchasePriceChange}
              />
            </div>
            <div className="w-full md:w-1/5">
              <Label htmlFor="discountPercent">Desconto (%)</Label>
              <Input
                type="number"
                id="discountPercent"
                value={discountPercent}
                onChange={handleDiscountPercentChange}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddProduct}><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
            </div>
          </div>
        </div>
        
        {items.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Itens da Entrada</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Compra
                    </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desconto (%)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.purchasePrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.discountPercent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="outline" size="sm" onClick={() => handleRemoveItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Guardar Entrada</Button>
        </div>
      </div>
    </div>
  );
};

export default StockEntryNew;
