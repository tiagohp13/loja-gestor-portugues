import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  code: string;
  stock: number;
  minStock: number;
}

interface LowStockProductsProps {
  lowStockProducts: Product[];
  navigateToProductDetail: (id: string) => void;
}

const LowStockProducts: React.FC<LowStockProductsProps> = ({
  lowStockProducts,
  navigateToProductDetail,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 max-h-[300px] overflow-y-auto">
      {/* Apenas esta linha foi alterada */}
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">
        Produtos com Stock Baixo
      </h3>

      {lowStockProducts.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum produto em stock baixo.
        </p>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase dark:text-gray-400">
              <th className="px-2 py-1">Produto</th>
              <th className="px-2 py-1">Código</th>
              <th className="px-2 py-1">Stock</th>
              <th className="px-2 py-1">Mínimo</th>
              <th className="px-2 py-1">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((prod) => (
              <tr
                key={prod.id}
                className="border-t last:border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => navigateToProductDetail(prod.id)}
              >
                <td className="px-2 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {prod.name}
                </td>
                <td className="px-2 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {prod.code}
                </td>
                <td className="px-2 py-2 text-sm font-medium text-red-500">
                  {prod.stock}
                </td>
                <td className="px-2 py-2 text-sm text-gray-700 dark:text-gray-200">
                  {prod.minStock}
                </td>
                <td className="px-2 py-2 text-sm text-blue-500 underline">
                  Ver Detalhes
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LowStockProducts;
