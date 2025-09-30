
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ProductDetailHeaderProps {
  productName: string;
  productCode: string;
  productId: string;
  isDeleted?: boolean;
}

const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({ 
  productName, 
  productCode,
  productId,
  isDeleted = false
}) => {
  const navigate = useNavigate();
  
  return (
    <PageHeader 
      title={productName} 
      description={`Código: ${productCode}`}
      actions={
        <>
          {!isDeleted && (
            <Button onClick={() => navigate(`/produtos/editar/${productId}`)}>
              <Pencil className="h-4 w-4" />
              Editar Produto
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/produtos/consultar')}>
            Voltar ao Catálogo
          </Button>
        </>
      }
    />
  );
};

export default ProductDetailHeader;
