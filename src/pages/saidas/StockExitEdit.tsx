import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { StockExitItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import { useProducts } from "@/contexts/ProductsContext";
import { usePermissions } from "@/hooks/usePermissions";

interface StockExitFormData {
  clientId: string;
  clientName: string;
  date: string;
  invoiceNumber: string;
  notes: string;
  fromOrderId?: string;
  fromOrderNumber?: string;
  items: StockExitItem[];
}

const StockExitEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { canEdit } = usePermissions();
  const queryClient = useQueryClient();
  const { products } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StockExitFormData>({
    clientId: "",
    clientName: "",
    date: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    notes: "",
    fromOrderId: undefined,
    fromOrderNumber: undefined,
    items: [],
  });

  // Verificar permissões
  useEffect(() => {
    if (!canEdit) {
      toast.error("Não tem permissão para editar vendas");
      navigate("/saidas/historico");
    }
  }, [canEdit, navigate]);

  useEffect(() => {
    if (id) fetchStockExit(id);
  }, [id]);

  const fetchStockExit = async (exitId: string) => {
    try {
      setIsLoading(true);
      const { data: exitData, error } = await supabase
        .from("stock_exits")
        .select(`*, stock_exit_items(*)`)
        .eq("id", exitId)
        .single();

      if (error) throw error;

      if (exitData) {
        const dateObj = new Date(exitData.date);
        const formattedDate = dateObj.toISOString().split("T")[0];

        setFormData({
          clientId: exitData.client_id || "",
          clientName: exitData.client_name || "",
          date: formattedDate,
          invoiceNumber: exitData.invoice_number || "",
          notes: exitData.notes || "",
          fromOrderId: exitData.from_order_id,
          fromOrderNumber: exitData.from_order_number,
        items: (exitData.stock_exit_items || []).map((item: any) => ({
          id: item.id,
          productId: String(item.product_id || ""),
          productName: item.product_name,
          quantity: Number(item.quantity) || 0,
          salePrice: Number(item.sale_price || 0),
          discountPercent: item.discount_percent ? Number(item.discount_percent) : 0,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        });
      }
    } catch (error) {
      // Error handled by toast
      toast.error("Erro ao carregar saída de stock");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const newItem: StockExitItem = {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      quantity: 1,
      salePrice: 0,
      discountPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (
    index: number,
    field: keyof Omit<StockExitItem, "id" | "createdAt" | "updatedAt">,
    value: string | number,
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.salePrice;
      const discount = itemTotal * ((item.discountPercent || 0) / 100);
      return sum + (itemTotal - discount);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Por favor selecione um cliente");
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Por favor adicione pelo menos um item");
      return;
    }
    if (formData.items.some((item) => !item.productName.trim())) {
      toast.error("Por favor selecione todos os produtos");
      return;
    }

    try {
      setIsLoading(true);

      const { error: exitError } = await supabase
        .from("stock_exits")
        .update({
          client_id: formData.clientId,
          client_name: formData.clientName,
          date: formData.date,
          invoice_number: formData.invoiceNumber,
          notes: formData.notes,
          from_order_id: formData.fromOrderId,
          from_order_number: formData.fromOrderNumber,
        })
        .eq("id", id);

      if (exitError) throw exitError;

      // Apagar os itens antigos antes de inserir os novos
      await supabase.from("stock_exit_items").delete().eq("exit_id", id);

      // Inserir os novos itens com o nome correto da coluna sale_price
      const itemsToInsert = formData.items.map((item) => ({
        exit_id: id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        sale_price: item.salePrice, // ✅ nome correto no Supabase
        discount_percent: item.discountPercent,
      }));

      const { error: itemsError } = await supabase.from("stock_exit_items").insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["stock-exits"] });

      toast.success("Saída de stock atualizada com sucesso");
      navigate("/saidas/historico");
    } catch (error) {
      console.error("Error updating stock exit:", error);
      toast.error("Erro ao atualizar saída de stock");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

  const handleCancel = () => navigate("/saidas/historico");
  const handleSave = () => {
    const form = document.querySelector("form");
    if (form) form.requestSubmit();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Editar Saída de Stock"
        description="Atualize as informações da saída de stock"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "A guardar..." : "Guardar Saída"}
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Saída</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Input id="client" type="text" value={formData.clientName} disabled />
            </div>

            <div>
              <Label htmlFor="date">Data da Saída *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="invoiceNumber">Número da Fatura</Label>
              <Input
                id="invoiceNumber"
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Opcional"
              />
            </div>

            {formData.fromOrderNumber && (
              <div>
                <Label htmlFor="fromOrder">Encomenda de Origem</Label>
                <Input id="fromOrder" type="text" value={formData.fromOrderNumber} disabled />
              </div>
            )}

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais sobre a saída..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Itens da Saída</CardTitle>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-gestorApp-gray">
                <p>Nenhum item adicionado ainda.</p>
                <Button type="button" onClick={addItem} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead>Desconto (%)</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => {
                    const subtotal = item.quantity * item.salePrice * (1 - (item.discountPercent || 0) / 100);
                    return (
                      <TableRow key={`${item.productId}-${index}`}>
                        <TableCell>
                          <select
                            value={item.productId || ""}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const selectedProduct = products.find((p) => String(p.id) === selectedId);

                              setFormData((prev) => {
                                const updatedItems = [...prev.items];
                                if (selectedProduct) {
                                  updatedItems[index] = {
                                    ...updatedItems[index],
                                    productId: String(selectedProduct.id),
                                    productName: selectedProduct.name,
                                    salePrice: selectedProduct.salePrice || 0,
                                  };
                                } else {
                                  updatedItems[index] = {
                                    ...updatedItems[index],
                                    productId: "",
                                    productName: "",
                                  };
                                }
                                return { ...prev, items: updatedItems };
                              });
                            }}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            required
                          >
                            <option value="">Selecione um produto...</option>
                            {products.map((product) => (
                              <option key={product.id} value={String(product.id)}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={item.salePrice}
                            onChange={(e) => updateItem(index, "salePrice", parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={item.discountPercent || 0}
                            onChange={(e) => updateItem(index, "discountPercent", parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(subtotal)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div></div>
                <div></div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gestorApp-blue">
                    Total: {formatCurrency(calculateTotal())}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default StockExitEdit;
