
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';

const ClientNew = () => {
  const navigate = useNavigate();
  const { addClient } = useData();
  const [client, setClient] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(client);
    navigate('/clientes/consultar');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Criar Novo Cliente" 
        description="Adicione um novo cliente à base de dados" 
        actions={
          <Button variant="outline" onClick={() => navigate('/clientes/consultar')}>
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
                value={client.name}
                onChange={handleChange}
                placeholder="Nome completo"
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
                value={client.email}
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
                value={client.phone}
                onChange={handleChange}
                placeholder="912345678"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium text-gestorApp-gray-dark">
                Morada
              </label>
              <Input
                id="address"
                name="address"
                value={client.address}
                onChange={handleChange}
                placeholder="Morada completa"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Notas
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={client.notes}
              onChange={handleChange}
              placeholder="Notas adicionais sobre o cliente"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/clientes/consultar')}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cliente</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientNew;
