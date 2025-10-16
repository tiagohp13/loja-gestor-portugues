import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import { OrderTypeSelector } from "./components/OrderTypeSelector";
import { DeliveryInformation } from "./components/DeliveryInformation";
import { format, parseISO, startOfDay } from "date-fns";
import ProductSelector from "./components/ProductSelector";

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
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Estados do ProductSelector (idênticos à Nova Encomenda) ---
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

  useEffect(() => {
    fetchClients();
    fetchProducts();
    if (id) fetchOrder(id);
  }, [id]);

  // --- Fetch Clients / Products / Order ---
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").neq("status", "deleted").order("name");
      if (error) throw error;
      if (data) {
        setClients(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
            taxId: c.tax_id || "",
            notes: c.notes || "",
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            status: c.status,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast.error("Erro ao carregar clientes");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").neq("status", "deleted").order("name");
      if (error) throw error;
      if (data) {
        const formatted = data.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          description: p.description || "",
          category: p.category || "",
          purchasePrice: Number(p.purchase_price),
          salePrice: Number(p.sale_price),
          currentStock: Number(p.current_stock),
          minStock: Number(p.min_stock),
          image: p.image || "",
          status: p.status || "active",
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
        setProducts(formatted);
        setFilteredProducts(formatted);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Erro ao carregar produtos");
    }
  };

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("orders").select(`*, order_items(*)`).eq("id", orderId).single();
      if (error) throw error;

      const parsedDate = parseISO(data.date);
      const localDate = startOfDay(parsedDate);

      const deliveryDate = data.expected_delivery_date ? startOfDay(parseISO(data.expected_delivery_date)) : undefined;

      setFormData({
        clientId: data.client_id || "",
        clientName: data.client_name || "",
        date: format(localDate, "yyyy-MM-dd"),
        notes: data.notes || "",
        discount: Number(data.discount || 0),
        orderType: (data.order_type as "combined" | "awaiting_stock") || "combined",
        expectedDeliveryDate: deliveryDate,
        expectedDeliveryTime: data.expected_delivery_time || "",
        deliveryLocation: data.delivery_location || "",
        items: (data.order_items || []).map((i: any) => ({
          id: i.id,
          productId: i.product_id,
          productName: i.product_name,
          quantity: i.quantity,
          salePrice: Number(i.sale_price),
          discountPercent: i.discount_percent ? Number(i.discount_percent) : 0,
          createdAt: i.created_at,
          updatedAt: i.updated_at,
        })),
      });
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error("Erro ao carregar encomenda");
    } finally {
      setIsLoading(false);
    }
  };
  // --- Atualizações de formulário ---
  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setFormData({ ...formData, clientId, clientName: client?.name || "" });
  };

  // --- Filtros de pesquisa do ProductSelector ---
  useEffect(() => {
    if (!productSearchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const term = productSearchTerm.toLowerCase();
      setFilteredProducts(
        products.filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)),
      );
    }
  }, [productSearchTerm, products]);

  // --- Selecionar produto da lista ---
  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      setCurrentSalePrice(product.salePrice);
      setProductSearchTerm(`${product.code} - ${product.name}`);
      setProductSearchOpen(false);
    }
  };

  // --- Adicionar produto à encomenda ---
  const handleAddProduct = () => {
    if (!currentProduct) {
      toast.error("Selecione um produto primeiro");
      return;
    }

    // se já existir o mesmo produto, soma quantidade
    const existing = formData.items.find((i) => i.productId === currentProduct.id);

    let updatedItems;
    if (existing) {
      updatedItems = formData.items.map((i) =>
        i.productId === currentProduct.id ? { ...i, quantity: i.quantity + currentQuantity } : i,
      );
    } else {
      const newItem: OrderItem = {
        id: crypto.randomUUID(),
        productId: currentProduct.id,
        productName: `${currentProduct.code} - ${currentProduct.name}`,
        quantity: currentQuantity,
        salePrice: currentSalePrice,
        discountPercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedItems = [...formData.items, newItem];
    }

    setFormData({ ...formData, items: updatedItems });
    setCurrentProduct(null);
    setProductSearchTerm("");
    setCurrentQuantity(1);
    setCurrentSalePrice(0);
  };

  // --- Remover e atualizar items ---
  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (
    index: number,
    field: keyof Omit<OrderItem, "id" | "createdAt" | "updatedAt">,
    value: string | number,
  ) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, items: updated });
  };

  // --- Cálculo total ---
  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      const subtotal = item.quantity * item.salePrice;
      const discount = subtotal * ((item.discountPercent || 0) / 100);
      return sum + (subtotal - discount);
    }, 0);
    const globalDiscount = itemsTotal * ((formData.discount || 0) / 100);
    return itemsTotal - globalDiscount;
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

  // ------------------- RENDER -------------------
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Editar Encomenda" />
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/encomendas/consultar")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" form="order-edit-form" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "A guardar..." : "Guardar Encomenda"}
          </Button>
        </div>
      </div>

      <form id="order-edit-form" onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Encomenda</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cliente *</Label>
              <Select value={formData.clientId} onValueChange={handleClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data da Encomenda *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <OrderTypeSelector
                value={formData.orderType}
                onChange={(value) => {
                  if (value === "awaiting_stock") {
                    setFormData({
                      ...formData,
                      orderType: value,
                      expectedDeliveryDate: undefined,
                      expectedDeliveryTime: "",
                      deliveryLocation: "",
                    });
                  } else setFormData({ ...formData, orderType: value });
                }}
              />
            </div>

            <div className="md:col-span-2">
              <DeliveryInformation
                orderType={formData.orderType}
                expectedDeliveryDate={formData.expectedDeliveryDate}
                expectedDeliveryTime={formData.expectedDeliveryTime}
                deliveryLocation={formData.deliveryLocation}
                onDeliveryDateChange={(d) => setFormData({ ...formData, expectedDeliveryDate: d })}
                onDeliveryTimeChange={(t) => setFormData({ ...formData, expectedDeliveryTime: t })}
                onDeliveryLocationChange={(l) => setFormData({ ...formData, deliveryLocation: l })}
              />
            </div>
          </CardContent>
        </Card>

        {/* ----------- NOVO ProductSelector ----------- */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              productSearchTerm={productSearchTerm}
              setProductSearchTerm={setProductSearchTerm}
              productSearchOpen={productSearchOpen}
              setProductSearchOpen={setProductSearchOpen}
              filteredProducts={filteredProducts}
              handleSelectProduct={handleSelectProduct}
              currentProduct={currentProduct}
              currentQuantity={currentQuantity}
              currentSalePrice={currentSalePrice}
              setCurrentQuantity={setCurrentQuantity}
              setCurrentSalePrice={setCurrentSalePrice}
              handleAddProduct={handleAddProduct}
            />

            {formData.items.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Nenhum produto adicionado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Desconto (%)</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, idx) => {
                    const subtotal = item.quantity * item.salePrice * (1 - (item.discountPercent || 0) / 100);
                    return (
                      <TableRow key={idx}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={item.salePrice}
                            onChange={(e) => updateItem(idx, "salePrice", parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={item.discountPercent || 0}
                            onChange={(e) => updateItem(idx, "discountPercent", parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(subtotal)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        {formData.items.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end">
                <div className="text-2xl font-bold text-gestorApp-blue">Total: {formatCurrency(calculateTotal())}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );

  // --- Guardar Encomenda ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Por favor selecione um cliente");
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Por favor adicione pelo menos um produto");
      return;
    }

    try {
      setIsLoading(true);

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          client_id: formData.clientId,
          client_name: formData.clientName,
          date: formData.date,
          notes: formData.notes,
          discount: formData.discount,
          order_type: formData.orderType,
          expected_delivery_date:
            formData.orderType === "combined" && formData.expectedDeliveryDate
              ? format(startOfDay(formData.expectedDeliveryDate), "yyyy-MM-dd")
              : null,
          expected_delivery_time: formData.orderType === "combined" ? formData.expectedDeliveryTime || null : null,
          delivery_location: formData.orderType === "combined" ? formData.deliveryLocation || null : null,
        })
        .eq("id", id);

      if (orderError) throw orderError;

      // apagar e recriar items
      const { error: deleteError } = await supabase.from("order_items").delete().eq("order_id", id);
      if (deleteError) throw deleteError;

      const itemsToInsert = formData.items.map((i) => ({
        order_id: id,
        product_id: i.productId,
        product_name: i.productName,
        quantity: i.quantity,
        sale_price: i.salePrice,
        discount_percent: i.discountPercent,
      }));

      const { error: insertError } = await supabase.from("order_items").insert(itemsToInsert);
      if (insertError) throw insertError;

      toast.success("Encomenda atualizada com sucesso");
      navigate("/encomendas/consultar");
    } catch (err) {
      console.error("Erro ao atualizar encomenda:", err);
      toast.error("Erro ao atualizar encomenda");
    } finally {
      setIsLoading(false);
    }
  }
};

export default OrderEdit;
