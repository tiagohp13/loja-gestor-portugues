
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

const ClientEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, updateClient } = useData();
  
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      const foundClient = getClient(id);
      if (foundClient) {
        setClient({
          name: foundClient.name || '',
          email: foundClient.email || '',
          phone: foundClient.phone || '',
          address: foundClient.address || '',
          taxId: foundClient.taxId || '',
          notes: foundClient.notes || ''
        });
      } else {
        toast.error('Cliente não encontrado');
        navigate('/clientes/consultar');
      }
    }
  }, [id, getClient, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateClient(id, client);
      toast.success('Cliente atualizado com sucesso');
      navigate(`/clientes/${id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Editar Cliente" 
        description="Atualize os detalhes do cliente" 
        actions={
          <Button variant="outline" onClick={() => navigate(`/clientes/${id}`)}>
            Voltar aos Detalhes
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
                placeholder="Nome do cliente"
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
                placeholder="Número de telefone"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium text-gestorApp-gray-dark">
                NIF
              </label>
              <Input
                id="taxId"
                name="taxId"
                value={client.taxId}
                onChange={handleChange}
                placeholder="Número de identificação fiscal"
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
              value={client.address}
              onChange={handleChange}
              placeholder="Endereço completo"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gestorApp-gray-dark">
              Observações
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={client.notes}
              onChange={handleChange}
              placeholder="Notas ou observações sobre o cliente"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate(`/clientes/${id}`)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Alterações</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientEdit;
