
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatting';

interface ClickableProductItemProps {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

const ClickableProductItem: React.FC<ClickableProductItemProps> = ({
  productId,
  name,
  quantity,
  price,
  total
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/produtos/${productId}`);
  };
  
  return (
    <tr 
      onClick={handleClick}
      className="hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <td className="p-2">{name}</td>
      <td className="p-2 text-center">{quantity}</td>
      <td className="p-2 text-right">{formatCurrency(price)}</td>
      <td className="p-2 text-right">{formatCurrency(total)}</td>
    </tr>
  );
};

export default ClickableProductItem;
