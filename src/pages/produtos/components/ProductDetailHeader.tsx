
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';

interface ProductDetailHeaderProps {
  productName: string;
  productCode: string;
  productId: string;
}

const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({ 
  productName, 
  productCode,
  productId
}) => {
  const navigate = useNavigate();
  
  return (
    <PageHeader 
      title={productName} 
      description={`Código: ${productCode}`}
      actions={
        <div className="flex space-x-2">
          <Button onClick={() => navigate(`/produtos/editar/${productId}`)}>
            Editar Produto
          </Button>
          <Button variant="outline" onClick={() => navigate('/produtos/consultar')}>
            Voltar ao Catálogo
          </Button>
        </div>
      }
    />
  );
};

export default ProductDetailHeader;
