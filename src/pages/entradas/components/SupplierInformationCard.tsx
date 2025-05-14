
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierWithAddress } from '@/types';

type SupplierInformationCardProps = {
  supplier: SupplierWithAddress;
};

const SupplierInformationCard: React.FC<SupplierInformationCardProps> = ({ supplier }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Fornecedor</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Nome</p>
          <a 
            href={`/fornecedores/${supplier.id}`}
            className="text-gestorApp-blue hover:underline cursor-pointer"
          >
            {supplier.name}
          </a>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Email</p>
          <p>{supplier.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Telefone</p>
          <p>{supplier.phone || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">NIF</p>
          <p>{supplier.taxId || 'N/A'}</p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <p className="text-sm font-medium mb-1">Morada</p>
          <p>{supplier.address ? supplier.address.street : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierInformationCard;
