import { useEffect, useRef } from "react";
import { checkAlerts } from "@/utils/alertsService";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Componente que gere alertas automáticos em background
 * Executa verificação ao montar e a cada 15 minutos
 */
const AlertsManager: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const hasRunInitialCheck = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Executar verificação inicial apenas uma vez
    if (!hasRunInitialCheck.current) {
      // Aguardar 2 segundos após login para não conflitar com outros toasts
      const initialTimeout = setTimeout(() => {
        checkAlerts();
        hasRunInitialCheck.current = true;
      }, 2000);

      // Configurar verificação periódica a cada 15 minutos
      const interval = setInterval(() => {
        checkAlerts();
      }, 15 * 60 * 1000); // 15 minutos

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  return null; // Componente invisível
};

export default AlertsManager;
