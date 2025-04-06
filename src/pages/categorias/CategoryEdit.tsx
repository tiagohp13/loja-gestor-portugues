
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCategory, updateCategory } = useData();
  const [category, setCategory] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (id) {
      const foundCategory = getCategory(id);
      if (foundCategory) {
        setCategory({
          name: foundCategory.name || '',
          description: foundCategory.description || ''
        });
      } else {
        toast.error('Categoria não encontrada');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateCategory(id, category);
      navigate(`/categorias/${id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Editar Categoria"
        description="Atualize os detalhes da categoria"
        actions={
          <Button variant="outline" onClick={() => navigate(`/categorias/${id}`)}>
            Voltar aos Detalhes
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
            <Button variant="outline" type="button" onClick={() => navigate(`/categorias/${id}`)}>
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
