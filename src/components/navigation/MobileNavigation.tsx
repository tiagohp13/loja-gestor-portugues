
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Truck, ShoppingCart, 
  LogIn, LogOut, Settings, Tag, BarChart
} from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      isActive: location.pathname === '/' || location.pathname === '/dashboard'
    },
    {
      path: '/produtos/consultar',
      label: 'Produtos',
      icon: <Package className="w-5 h-5" />,
      isActive: location.pathname.includes('/produtos')
    },
    {
      path: '/clientes/consultar',
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
      isActive: location.pathname.includes('/clientes')
    },
    {
      path: '/fornecedores/consultar',
      label: 'Fornecedores',
      icon: <Truck className="w-5 h-5" />,
      isActive: location.pathname.includes('/fornecedores')
    },
    {
      path: '/encomendas/consultar',
      label: 'Encomendas',
      icon: <ShoppingCart className="w-5 h-5" />,
      isActive: location.pathname.includes('/encomendas')
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center px-2 py-1 w-full ${
              item.isActive 
                ? 'text-gestorApp-blue' 
                : 'text-gestorApp-gray hover:text-gestorApp-blue'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
