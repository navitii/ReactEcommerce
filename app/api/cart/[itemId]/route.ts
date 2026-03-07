import { NextRequest, NextResponse } from 'next/server';
import { getCart, saveCart, calculateCartPricing, addEvent } from '@/lib/repository';

const USER_ID = 'user-123';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const cart = await getCart(USER_ID);
  
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item.id !== itemId);
  
  if (cart.items.length === initialLength) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  cart.pricing = calculateCartPricing(cart.items);
  await saveCart(cart);

  await addEvent({
    userId: USER_ID,
    type: 'CART_ITEM_REMOVED',
    source: 'web',
    payload: { itemId }
  });

  await addEvent({
    userId: USER_ID,
    type: 'PRICING_CALCULATED',
    source: 'api',
    payload: { pricing: cart.pricing }
  });

  return NextResponse.json(cart);
}
