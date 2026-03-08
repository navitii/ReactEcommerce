export type ModifierOption = {
  id: string;
  name: string;
  priceCents: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  basePriceCents: number;
  imageUrl: string;
  modifierGroups: ModifierGroup[];
};

export type CartItemModifier = {
  groupId: string;
  optionId: string;
  name: string;
  priceCents: number;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  modifiers: CartItemModifier[];
  productImage: string;
};

export type CartPricing = {
  subtotalCents: number;
  taxCents: number;
  serviceFeeCents: number;
  totalCents: number;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  pricing: CartPricing;
};

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  pricing: CartPricing;
  status: OrderStatus;
  createdAt: string;
  idempotencyKey?: string;
};

export type EventType = 
  | 'CART_ITEM_ADDED'
  | 'CART_ITEM_UPDATED'
  | 'CART_ITEM_REMOVED'
  | 'PRICING_CALCULATED'
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_CHANGED'
  | 'VALIDATION_FAILED';

export type TimelineEvent = {
  eventId: string;
  timestamp: string;
  orderId?: string;
  userId: string;
  type: EventType;
  source: 'web' | 'api' | 'worker';
  correlationId?: string;
  payload: any;
};
