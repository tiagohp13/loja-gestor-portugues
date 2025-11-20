import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";

const ProductNew = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const { categories } = useCategoriesQuery();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [hasMinStock, setHasMinStock] = useState(false);
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (purchasePrice < 0 || salePrice < 0 || currentStock < 0 || minStock < 0) {
      toast.error("Valores não podem ser negativos");
      return;
    }

    if (purchasePrice > salePrice) {
      toast.warning("O preço de compra é maior que o preço de venda.");
    }

    setIsSubmitting(true);

    try {
      await addProduct({
        name,
        code,
        description,
        category,
        purchasePrice,
        salePrice,
        currentStock,
        minStock: hasMinStock ? minStock : 0,
        image,
        status: "active",
      });
      navigate("/produtos/consultar");
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Novo Produto"
        description="Adicione um novo produto ao seu inventário"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/produtos/consultar")}
              disabled={isSubmitting}
              className="sm:h-10 sm:px-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>

            <Button
              type="submit"
              form="product-form"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground sm:h-10 sm:px-6"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "A guardar..." : "Guardar Produto"}
            </Button>
          </div>
        }
      />

      <div className="bg-card rounded-lg shadow p-6 mt-6">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gestorApp-gray-dark">
                Código
              </label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código único do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gestorApp-gray-dark">
                Nome
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do produto"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gestorApp-gray-dark">
                Categoria
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium text-gestorApp-gray-dark">
                URL da Imagem
              </label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="URL da imagem do produto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gestorApp-gray-dark">
              Descrição
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do produto"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="purchasePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço de Compra (€)
              </label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="1"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salePrice" className="text-sm font-medium text-gestorApp-gray-dark">
                Preço de Venda (€)
              </label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="1"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="currentStock" className="text-sm font-medium text-gestorApp-gray-dark">
                Stock Atual
              </label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                step="1"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 h-[42px]">
                <Checkbox 
                  id="hasMinStock"
                  checked={hasMinStock}
                  onCheckedChange={(checked) => setHasMinStock(checked as boolean)}
                />
                <Label 
                  htmlFor="hasMinStock" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Stock mínimo
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="minStock" className="text-sm font-medium text-gestorApp-gray-dark">
                Valor Mínimo
              </label>
              <Input
                id="minStock"
                type="number"
                min="0"
                step="1"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                placeholder="0"
                disabled={!hasMinStock}
                className={!hasMinStock ? 'opacity-50 cursor-not-allowed' : ''}
              />
              {hasMinStock && (
                <p className="text-xs text-muted-foreground">
                  Alerta quando atingir este valor
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductNew;
