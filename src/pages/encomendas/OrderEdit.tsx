import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderQuery, useOrdersQuery } from "@/hooks/queries/useOrders";
import { useClientsQuery } from "@/hooks/queries/useClients";
import { useProductsQuery } from "@/hooks/queries/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Client, OrderItem, Product } from "@/types";
import PageHeader from "@/components/ui/PageHeader";
import { OrderTypeSelector } from "./components/OrderTypeSelector";
import { DeliveryInformation } from "./components/DeliveryInformation";
import { format, parseISO, startOfDay } from "date-fns";
import ProductSelector from "./components/ProductSelector";
import TableSkeleton from "@/components/ui/TableSkeleton";

interface OrderFormData {
  clientId: string;
  clientName: string;
  date: string;
  notes: string;
  discount: number;
  items: OrderItem[];
  orderType: "combined" | "awaiting_stock";
  expectedDeliveryDate?: Date;
  expectedDeliveryTime?: string;
  deliveryLocation?: string;
}

const OrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading: orderLoading } = useOrderQuery(id);
  const { updateOrder } = useOrdersQuery();
  const { clients } = useClientsQuery();
  const { products } = useProductsQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Estados do ProductSelector ---
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentSalePrice, setCurrentSalePrice] = useState(0);

  const [formData, setFormData] = useState<OrderFormData>({
    clientId: "",
    clientName: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    discount: 0,
    items: [],
    orderType: "combined",
    expectedDeliveryDate: undefined,
    expectedDeliveryTime: "",
    deliveryLocation: "",
  });

  // Load order data when available
  useEffect(() => {
    if (order) {
      const parsedDate = order.date ? startOfDay(parseISO(order.date)) : startOfDay(new Date());
      const deliveryDate = order.expectedDeliveryDate ? startOfDay(parseISO(order.expectedDeliveryDate)) : undefined;

      setFormData({
        clientId: order.clientId || "",
        clientName: order.clientName || "",
        date: format(parsedDate, "yyyy-MM-dd"),
        notes: order.notes || "",
        discount: Number(order.discount || 0),
        orderType: (order.orderType as "combined" | "awaiting_stock") || "combined",
        expectedDeliveryDate: deliveryDate,
        expectedDeliveryTime: order.expectedDeliveryTime || "",
        deliveryLocation: order.deliveryLocation || "",
        items: (order.items || []).map((i: any) => ({
          id: i.id || "",
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          salePrice: Number(i.salePrice),
          discountPercent: i.discountPercent ? Number(i.discountPercent) : 0,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
        })),
      });
    }
  }, [order]);

  // Filter products for search
  useEffect(() => {
    if (productSearchTerm.trim()) {
      const lowerSearch = productSearchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) => p.name.toLowerCase().includes(lowerSearch) || p.code.toLowerCase().includes(lowerSearch)
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [productSearchTerm, products]);

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    
    setCurrentProduct(product);
    setCurrentSalePrice(product.salePrice);
    setCurrentQuantity(1);
    setProductSearchTerm(product.name);
    setProductSearchOpen(false);
  };

  const handleAddProduct = () => {
    if (!currentProduct) {
      toast.error("Selecione um produto");
      return;
    }
    if (currentQuantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }

    const newItem: OrderItem = {
      id: "",
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantity: currentQuantity,
      salePrice: currentSalePrice,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset
    setCurrentProduct(null);
    setCurrentQuantity(1);
    setCurrentSalePrice(0);
    setProductSearchTerm("");
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: field === "quantity" || field === "salePrice" ? Number(value) : value } : item
      ),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.salePrice;
      const discount = item.discountPercent || 0;
      return sum + itemTotal * (1 - discount / 100);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Selecione um cliente");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Adicione pelo menos um produto");
      return;
    }

    setIsSubmitting(true);

    updateOrder({
      id: id!,
      clientId: formData.clientId,
      clientName: formData.clientName,
      date: formData.date,
      notes: formData.notes,
      discount: formData.discount,
      orderType: formData.orderType,
      expectedDeliveryDate: formData.expectedDeliveryDate ? format(formData.expectedDeliveryDate, "yyyy-MM-dd") : null,
      expectedDeliveryTime: formData.expectedDeliveryTime || null,
      deliveryLocation: formData.deliveryLocation || null,
      items: formData.items,
    } as any, {
      onSuccess: () => {
        navigate(`/encomendas/${id}`);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  if (orderLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Editar Encomenda"
          description="Atualize os detalhes da encomenda"
        />
        <TableSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Encomenda não encontrada</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/encomendas/consultar')}>
          Voltar à Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Editar Encomenda"
        description="Atualize os detalhes da encomenda"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate(`/encomendas/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    const client = clients.find((c) => c.id === value);
                    setFormData((prev) => ({
                      ...prev,
                      clientId: value,
                      clientName: client?.name || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <span>{formData.clientName || "Selecione um cliente"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <OrderTypeSelector
              value={formData.orderType}
              onChange={(type) => setFormData((prev) => ({ ...prev, orderType: type }))}
            />

            <DeliveryInformation
              orderType={formData.orderType}
              expectedDeliveryDate={formData.expectedDeliveryDate}
              expectedDeliveryTime={formData.expectedDeliveryTime}
              deliveryLocation={formData.deliveryLocation}
              onDeliveryDateChange={(date) => setFormData((prev) => ({ ...prev, expectedDeliveryDate: date }))}
              onDeliveryTimeChange={(time) => setFormData((prev) => ({ ...prev, expectedDeliveryTime: time }))}
              onDeliveryLocationChange={(loc) => setFormData((prev) => ({ ...prev, deliveryLocation: loc }))}
            />

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductSelector
              productSearchTerm={productSearchTerm}
              setProductSearchTerm={setProductSearchTerm}
              productSearchOpen={productSearchOpen}
              setProductSearchOpen={setProductSearchOpen}
              filteredProducts={filteredProducts}
              currentProduct={currentProduct}
              currentQuantity={currentQuantity}
              setCurrentQuantity={setCurrentQuantity}
              currentSalePrice={currentSalePrice}
              setCurrentSalePrice={setCurrentSalePrice}
              handleSelectProduct={handleSelectProduct}
              handleAddProduct={handleAddProduct}
            />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="w-24">Quantidade</TableHead>
                  <TableHead className="w-32">Preço</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, "quantity", e.target.value)}
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.salePrice}
                        onChange={(e) => handleUpdateItem(index, "salePrice", e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(item.quantity * item.salePrice).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end text-xl font-bold">
              Total: {calculateTotal().toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default OrderEdit;
