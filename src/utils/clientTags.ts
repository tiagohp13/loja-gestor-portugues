import { Client } from '@/types';
import { differenceInMonths, parseISO } from 'date-fns';

export type ClientTag = 'Novo' | 'Recorrente' | 'Inativo' | 'VIP';

export interface ClientTagConfig {
  inactivityMonths: number;
}

export const DEFAULT_TAG_CONFIG: ClientTagConfig = {
  inactivityMonths: 3
};

/**
 * Calcula a etiqueta automática para um cliente baseado no seu histórico de compras
 * Agora usa campos calculados diretamente da tabela clients
 */
export const calculateClientTag = (
  client: Client, 
  _unused: any[], // Mantido para compatibilidade
  config: ClientTagConfig = DEFAULT_TAG_CONFIG
): ClientTag => {
  const purchaseCount = client.purchaseCount || 0;
  const lastPurchaseDate = client.lastPurchaseDate;
  
  // Se não tem compras, verificar se é inativo
  if (purchaseCount === 0) {
    const clientCreatedDate = parseISO(client.createdAt);
    const monthsSinceCreation = differenceInMonths(new Date(), clientCreatedDate);
    
    // Se foi criado há mais tempo que o período de inatividade, é inativo
    if (monthsSinceCreation >= config.inactivityMonths) {
      return 'Inativo';
    }
    
    // Se foi criado recentemente e não tem compras, ainda é novo
    return 'Novo';
  }
  
  // Verificar se está inativo (sem compras nos últimos X meses)
  if (lastPurchaseDate) {
    const monthsSinceLastPurchase = differenceInMonths(new Date(), parseISO(lastPurchaseDate));
    
    if (monthsSinceLastPurchase >= config.inactivityMonths) {
      return 'Inativo';
    }
  }
  
  // VIP: Para uma classificação mais precisa de VIP, precisaríamos de dados temporais
  // Por enquanto, vamos classificar como VIP clientes com muitas compras (5+)
  if (purchaseCount >= 5) {
    return 'VIP';
  }
  
  // Classificar baseado no número de compras
  if (purchaseCount === 1) {
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
    case 'VIP':
      return 'bg-amber-100 text-amber-800 border-amber-200';
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
    case 'VIP':
      return 'Cliente VIP com 3+ compras nos últimos 3 meses';
    default:
      return '';
  }
};