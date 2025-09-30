
import { Client, Product } from "@/types";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
};

export interface OrderFormState {
  selectedClientId: string;
  selectedClient: Client | null;
  clientSearchTerm: string;
  clientSearchOpen: boolean;
  orderDate: Date;
  calendarOpen: boolean;
  orderItems: OrderItem[];
  productSearchTerm: string;
  productSearchOpen: boolean;
  currentProduct: Product | null;
  currentQuantity: number;
  notes: string;
  isSubmitting: boolean;
  orderType: 'combined' | 'awaiting_stock';
  expectedDeliveryDate?: Date;
  expectedDeliveryTime?: string;
  deliveryLocation?: string;
}
