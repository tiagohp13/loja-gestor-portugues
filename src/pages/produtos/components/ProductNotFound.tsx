
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProductNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">Produto não encontrado</h1>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/produtos/consultar')}>
        Voltar ao Catálogo
      </Button>
    </div>
  );
};

export default ProductNotFound;
