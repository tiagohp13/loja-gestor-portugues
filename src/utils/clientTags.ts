import { Client, StockExit } from '@/types';
import { differenceInMonths, parseISO } from 'date-fns';

export type ClientTag = 'Novo' | 'Recorrente' | 'Inativo';

export interface ClientTagConfig {
  inactivityMonths: number;
}

export const DEFAULT_TAG_CONFIG: ClientTagConfig = {
  inactivityMonths: 3
};

/**
 * Calcula a etiqueta automática para um cliente baseado no seu histórico de compras
 */
export const calculateClientTag = (
  client: Client, 
  stockExits: StockExit[], 
  config: ClientTagConfig = DEFAULT_TAG_CONFIG
): ClientTag => {
  // Filtrar apenas as saídas de stock para este cliente
  const clientExits = stockExits.filter(exit => exit.clientId === client.id);
  
  // Se não tem compras, verificar se é inativo
  if (clientExits.length === 0) {
    const clientCreatedDate = parseISO(client.createdAt);
    const monthsSinceCreation = differenceInMonths(new Date(), clientCreatedDate);
    
    // Se foi criado há mais tempo que o período de inatividade, é inativo
    if (monthsSinceCreation >= config.inactivityMonths) {
      return 'Inativo';
    }
    
    // Se foi criado recentemente e não tem compras, ainda não classificamos
    return 'Novo';
  }
  
  // Verificar se está inativo (sem compras nos últimos X meses)
  const lastPurchaseDate = clientExits
    .map(exit => parseISO(exit.date))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  
  const monthsSinceLastPurchase = differenceInMonths(new Date(), lastPurchaseDate);
  
  if (monthsSinceLastPurchase >= config.inactivityMonths) {
    return 'Inativo';
  }
  
  // Classificar baseado no número de compras
  if (clientExits.length === 1) {
    return 'Novo';
  } else {
    return 'Recorrente';
  }
};

/**
 * Obter a cor da etiqueta baseada no tipo
 */
export const getTagColor = (tag: ClientTag): string => {
  switch (tag) {
    case 'Novo':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Recorrente':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Inativo':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Obter a descrição da etiqueta
 */
export const getTagDescription = (tag: ClientTag): string => {
  switch (tag) {
    case 'Novo':
      return 'Cliente com apenas 1 compra registada';
    case 'Recorrente':
      return 'Cliente com múltiplas compras';
    case 'Inativo':
      return 'Cliente sem compras recentes';
    default:
      return '';
  }
};