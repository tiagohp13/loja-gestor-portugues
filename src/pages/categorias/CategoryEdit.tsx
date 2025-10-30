import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCategoriesQuery, useCategoryQuery } from "@/hooks/queries/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import TableSkeleton from "@/components/ui/TableSkeleton";

const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: foundCategory, isLoading } = useCategoryQuery(id);
  const { updateCategory } = useCategoriesQuery();
  const [category, setCategory] = useState({
    name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (foundCategory) {
      setCategory({
        name: foundCategory.name || "",
        description: foundCategory.description || "",
        status: foundCategory.status || "active",
      });
    }
  }, [foundCategory]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Editar Categoria"
          description="Atualize os detalhes da categoria"
        />
        <TableSkeleton title="A carregar categoria..." rows={3} columns={1} />
      </div>
    );
  }

  if (!foundCategory && !isLoading) {
    toast.error("Categoria não encontrada");
    navigate("/categorias/consultar");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (id) {
      updateCategory({ id, payload: category }, {
        onSuccess: () => {
          navigate("/categorias/consultar");
        },
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Editar Categoria"
        description="Atualize os detalhes da categoria"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate("/categorias/consultar")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Alterações
            </Button>
          </div>
        }
      />

      <div className="bg-card rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              name="name"
              value={category.name}
              onChange={handleChange}
              placeholder="Introduza o nome da categoria"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={category.description}
              onChange={handleChange}
              placeholder="Descrição da categoria (opcional)"
            />
          </div>

          <div className="space-y-2">
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

export default CategoryEdit;
