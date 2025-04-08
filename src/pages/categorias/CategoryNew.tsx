
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addCategory(category);
      toast.success('Categoria adicionada com sucesso!');
      navigate('/categorias');
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
          <Button variant="outline" onClick={() => navigate('/categorias')}>
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
            <select
              id="status"
              name="status"
              value={category.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/categorias')}>
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
