
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateString, formatCurrency } from '@/utils/formatting';
import { CalendarClock, MapPin, Mail, Phone, FileText, CreditCard, TrendingUp, Tag } from 'lucide-react';
import { Client } from '@/types';
import { useStock } from '@/contexts/StockContext';
import { calculateClientTag } from '@/utils/clientTags';
import ClientTag from '@/components/common/ClientTag';
import { useClientTags } from '@/hooks/useClientTags';

interface ClientInfoCardProps {
  client: Client;
  totalSpent: number;
  isLoadingTotal: boolean;
}

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client, totalSpent, isLoadingTotal }) => {
  const { stockExits } = useStock();
  const { config: tagConfig } = useClientTags();
  const clientTag = calculateClientTag(client, stockExits, tagConfig);
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Informações do Cliente</span>
          <StatusBadge status={client.status || 'active'} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <Tag className="h-5 w-5 mr-2 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Etiqueta</p>
            <ClientTag tag={clientTag} />
          </div>
        </div>

        {client.address && (
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Endereço</p>
              <p>{client.address}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start">
          <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Total Gasto</p>
            {isLoadingTotal ? (
              <p>Calculando...</p>
            ) : (
              <p className="font-semibold text-blue-600">{formatCurrency(totalSpent)}</p>
            )}
          </div>
        </div>
        
        {client.email && (
          <div className="flex items-start">
            <Mail className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">E-mail</p>
              <p>{client.email}</p>
            </div>
          </div>
        )}
        
        {client.phone && (
          <div className="flex items-start">
            <Phone className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone</p>
              <p>{client.phone}</p>
            </div>
          </div>
        )}
        
        {client.taxId && (
          <div className="flex items-start">
            <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">NIF</p>
              <p>{client.taxId}</p>
            </div>
          </div>
        )}
        
        {client.notes && (
          <div className="flex items-start">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Notas</p>
              <p className="whitespace-pre-line">{client.notes}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start">
          <CalendarClock className="h-5 w-5 mr-2 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-500">Data de Criação</p>
            <p>{formatDateString(client.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInfoCard;
