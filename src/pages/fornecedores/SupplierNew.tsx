
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';

const SupplierNew = () => {
  const navigate = useNavigate();
  const { addSupplier } = useData();
  const [supplier, setSupplier] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSupplier(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(supplier);
    navigate('/fornecedores/consultar');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Criar Novo Fornecedor" 
        description="Adicione um novo fornecedor à base de dados" 
        actions={
          <Button variant="outline" onClick={() => navigate('/fornecedores/consultar')}>
            Voltar à Lista
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gestorApp-gray-dark">
                Nome
              </label>
              <Input
                id="name"
                name="name"
                value={supplier.name}
                onChange={handleChange}
                placeholder="Nome da empresa"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gestorApp-gray-dark">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={supplier.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gestorApp-gray-dark">
                Telefone
              </label>
              <Input
                id="phone"
                name="phone"
                value={supplier.phone}
                onChange={handleChange}
                placeholder="912345678"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium text-gestorApp-gray-dark">
                NIF
              </label>
              <Input
                id="taxId"
                name="taxId"
                value={supplier.taxId}
                onChange={handleChange}
                placeholder="Número de Identificação Fiscal"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gestorApp-gray-dark">
              Morada
            </label>
            <Input
              id="address"
              name="address"
              value={supplier.address}
              onChange={handleChange}
              placeholder="Morada completa"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={supplier.notes}
              onChange={handleChange}
              placeholder="Notas adicionais sobre o fornecedor"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/fornecedores/consultar')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Fornecedor</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierNew;
