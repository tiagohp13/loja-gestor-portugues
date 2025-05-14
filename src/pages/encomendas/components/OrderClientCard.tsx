
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientWithAddress } from '@/types';

interface OrderClientCardProps {
  client: ClientWithAddress;
}

const OrderClientCard: React.FC<OrderClientCardProps> = ({ client }) => {
  const navigate = useNavigate();
  
  const handleViewClient = () => {
    navigate(`/clientes/${client.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Nome</p>
          <p>
            <a 
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={handleViewClient}
            >
              {client.name}
            </a>
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Email</p>
          <p>{client.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Telefone</p>
          <p>{client.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">NIF</p>
          <p>{client.taxId || 'N/A'}</p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <p className="text-sm font-medium mb-1">Morada</p>
          <p>{client.address ? client.address.street : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderClientCard;
