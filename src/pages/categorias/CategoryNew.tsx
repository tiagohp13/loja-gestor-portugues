
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';

const CategoryNew: React.FC = () => {
  const navigate = useNavigate();
  const { addCategory } = useData();
  const [category, setCategory] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory(category);
    navigate('/categorias/consultar');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Criar Nova Categoria"
        description="Adicione uma nova categoria para organizar seus produtos"
        actions={
          <Button variant="outline" onClick={() => navigate('/categorias/consultar')}>
            Voltar à Lista
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gestorApp-gray-dark">
              Nome da Categoria
            </label>
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
            <label htmlFor="description" className="text-sm font-medium text-gestorApp-gray-dark">
              Descrição
            </label>
            <Input
              id="description"
              name="description"
              value={category.description}
              onChange={handleChange}
              placeholder="Descrição da categoria (opcional)"
            />
          </div>

          <div className="flex justify-end space-x-4">
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
