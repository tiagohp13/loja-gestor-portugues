import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategoriesQuery } from "@/hooks/queries/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

const CategoryNew = () => {
  const navigate = useNavigate();
  const { createCategory } = useCategoriesQuery();
  const [category, setCategory] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setCategory((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!category.name.trim()) {
      toast.error("O nome da categoria é obrigatório");
      return;
    }

    createCategory(category, {
      onSuccess: () => {
        navigate("/categorias/consultar");
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Nova Categoria"
        description="Adicione uma nova categoria ao sistema"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate("/categorias/consultar")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Categoria
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              name="name"
              value={category.name}
              onChange={handleChange}
              required
              placeholder="Nome da categoria"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={category.description}
              onChange={handleChange}
              placeholder="Descrição da categoria"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={category.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryNew;
