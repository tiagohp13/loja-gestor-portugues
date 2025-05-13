
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory, updateCategory } = useData();
  const [category, setCategory] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    if (id) {
      const foundCategory = getCategory(id);
      if (foundCategory) {
        setCategory({
          name: foundCategory.name || '',
          description: foundCategory.description || '',
          status: foundCategory.status || 'active'
        });
      } else {
        toast({
          title: "Erro",
          description: "Categoria não encontrada",
          variant: "destructive"
        });
        navigate('/categorias/consultar');
      }
    }
  }, [id, getCategory, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setCategory(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!category.name.trim()) {
        toast({
          title: "Erro",
          description: "O nome da categoria é obrigatório",
          variant: "destructive"
        });
        return;
      }
      
      if (id) {
        await updateCategory(id, category);
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso"
        });
        navigate('/categorias/consultar'); // Corrected navigation path
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Editar Categoria"
        description="Atualize os detalhes da categoria"
        actions={
          <Button variant="outline" onClick={() => navigate('/categorias/consultar')}>
            Voltar à Lista
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow p-6 mt-6">
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
            <Select
              value={category.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/categorias/consultar')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
