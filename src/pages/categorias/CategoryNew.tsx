
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';
import { Category } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CategoryNew = () => {
  const navigate = useNavigate();
  const { addCategory } = useData();
  const [category, setCategory] = useState<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    status: 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        toast.error('O nome da categoria é obrigatório');
        return;
      }

      await addCategory(category);
      toast.success('Categoria adicionada com sucesso!');
      navigate('/categorias/consultar');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Nova Categoria" 
        description="Adicione uma nova categoria ao sistema"
        actions={
          <Button variant="outline" onClick={() => navigate('/categorias/consultar')}>
            Voltar à Lista
          </Button>
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
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/categorias/consultar')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Categoria</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryNew;
