
// Types
export interface ChildConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  color?: string;
}

export interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  children?: ChildConfig[];
}

export interface PageConfig {
  [key: string]: WidgetConfig[];
}

export interface LayoutConfig {
  dashboard: WidgetConfig[];
  statistics: WidgetConfig[];
}

export const colorOptions = [
  { name: 'Padrão', value: '' },
  { name: 'Azul', value: 'bg-blue-600' },
  { name: 'Verde', value: 'bg-green-600' },
  { name: 'Vermelho', value: 'bg-red-600' },
  { name: 'Roxo', value: 'bg-purple-600' },
  { name: 'Laranja', value: 'bg-orange-600' },
  { name: 'Amarelo', value: 'bg-yellow-500' },
  { name: 'Rosa', value: 'bg-pink-600' },
  { name: 'Turquesa', value: 'bg-teal-600' },
  { name: 'Cinza', value: 'bg-gray-600' }
];
