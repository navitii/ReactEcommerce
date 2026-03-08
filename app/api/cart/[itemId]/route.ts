import { NextRequest, NextResponse } from 'next/server';
import { getCart, saveCart, calculateCartPricing, addEvent, getProductById } from '@/lib/repository'
import { CartItemModifier } from '@/types';

const USER_ID = 'user-123';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const body = await req.json();
  const { quantity, modifiers } = body;

  const cart = await getCart(USER_ID);
  
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
  }

  const existingItem = cart.items[itemIndex];

  if (quantity < 1) {
    return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
  }

  const product = await getProductById(existingItem.productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  let newUnitPriceCents = product.basePriceCents;
  const validModifiers: CartItemModifier[] = [];

  if (modifiers && Array.isArray(modifiers)) {
    for (const mod of modifiers) {
      const group = product.modifierGroups.find(g => g.id === mod.groupId);
      if (group) {
        const option = group.options.find(o => o.id === mod.optionId);
        if (option) {
          newUnitPriceCents += option.priceCents;
          validModifiers.push({
            groupId: group.id,
            optionId: option.id,
            name: option.name,
            priceCents: option.priceCents
          });
        }
      }
    }
  }

  cart.items[itemIndex] = {
    ...existingItem,
    quantity,
    modifiers: validModifiers,
    unitPriceCents: newUnitPriceCents,
    totalPriceCents: newUnitPriceCents * quantity,
  };

  cart.pricing = calculateCartPricing(cart.items);
  await saveCart(cart);

  await addEvent({
    userId: USER_ID,
    type: 'CART_ITEM_UPDATED',
    source: 'web',
    payload: { itemId, quantity, modifiers: validModifiers }
  });

  await addEvent({
    userId: USER_ID,
    type: 'PRICING_CALCULATED',
    source: 'api',
    payload: { pricing: cart.pricing }
  });

  return NextResponse.json(cart);
}

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
