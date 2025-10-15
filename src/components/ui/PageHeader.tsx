import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * PageHeader com breadcrumbs simples integrados
 * Mostra o caminho atual (ex: "Configurações › Sistema")
 * e mantém compatibilidade com título, descrição e ações originais.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Converte o path (ex: /configuracoes/sistema) em "Configurações › Sistema"
  const breadcrumbs = React.useMemo(() => {
    const pathParts = location.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => {
        // Substitui hífens e primeiras letras em maiúsculas
        const formatted = part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
        return formatted;
      });

    if (pathParts.length === 0) return null;

    return <div className="text-xs sm:text-sm text-muted-foreground mb-1">{pathParts.join(" › ")}</div>;
  }, [location.pathname]);

  return (
    <div
      className={`flex flex-col ${isMobile ? "space-y-4" : "md:flex-row justify-between md:items-center"} mb-4 sm:mb-6`}
    >
      <div>
        {breadcrumbs}
        <h1 className="text-xl sm:text-2xl font-bold text-gestorApp-gray-dark">{title}</h1>
        {description && <p className="mt-1 text-sm sm:text-base text-gestorApp-gray">{description}</p>}
      </div>

      {actions && <div className={`${isMobile ? "w-full" : "mt-0"} flex flex-wrap items-center gap-3`}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
