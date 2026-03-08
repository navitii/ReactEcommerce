import { NextRequest, NextResponse } from 'next/server';
import { getCart, createOrder, getOrderByIdempotencyKey, addEvent, saveCart } from '@/lib/repository';
import { Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const USER_ID = 'user-123';

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('Idempotency-Key');

  if (idempotencyKey) {
    const existingOrder = await getOrderByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      return NextResponse.json({ orderId: existingOrder.id, status: existingOrder.status }, { status: 202 });
    }
  }

  const cart = await getCart(USER_ID);

  if (cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const orderId = uuidv4();
  
  const newOrder: Order = {
    id: orderId,
    userId: USER_ID,
    items: [...cart.items],
    pricing: { ...cart.pricing },
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
    idempotencyKey: idempotencyKey || undefined
  };

  await createOrder(newOrder);

  cart.items = [];
  cart.pricing = { subtotalCents: 0, taxCents: 0, serviceFeeCents: 0, totalCents: 0 };
  await saveCart(cart);

  await addEvent({
    userId: USER_ID,
    orderId: orderId,
    type: 'ORDER_PLACED',
    source: 'web',
    correlationId: idempotencyKey || undefined,
    payload: { orderId, totalCents: newOrder.pricing.totalCents }
  });

  setTimeout(async () => {
    newOrder.status = 'PREPARING';
    await createOrder(newOrder);
    await addEvent({
      userId: USER_ID,
      orderId: orderId,
      type: 'ORDER_STATUS_CHANGED',
      source: 'worker',
      payload: { oldStatus: 'ACCEPTED', newStatus: 'PREPARING' }
    });
  }, 5000);

  return NextResponse.json({ orderId }, { status: 202 });
}
