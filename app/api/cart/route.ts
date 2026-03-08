import { NextRequest, NextResponse } from 'next/server';
import { getCart, saveCart, getProductById, calculateCartPricing, addEvent } from '@/lib/repository';
import { CartItem, CartItemModifier } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const USER_ID = 'user-123';

export async function GET() {
  const cart = await getCart(USER_ID);
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, modifiers, quantity } = body;

  if (!productId || !quantity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const product = await getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  let unitPriceCents = product.basePriceCents;
  const validModifiers: CartItemModifier[] = [];

  if (modifiers && Array.isArray(modifiers)) {
    for (const mod of modifiers) {
      const group = product.modifierGroups.find(g => g.id === mod.groupId);
      if (group) {
        const option = group.options.find(o => o.id === mod.optionId);
        if (option) {
          unitPriceCents += option.priceCents;
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

  const newItem: CartItem = {
    id: uuidv4(),
    productId: product.id,
    productName: product.name,
    quantity,
    unitPriceCents,
    totalPriceCents: unitPriceCents * quantity,
    modifiers: validModifiers,
    productImage: product.imageUrl
  };

  const cart = await getCart(USER_ID);
  cart.items.push(newItem);
  cart.pricing = calculateCartPricing(cart.items);
  await saveCart(cart);

  // Log Event
  await addEvent({
    userId: USER_ID,
    type: 'CART_ITEM_ADDED',
    source: 'web',
    payload: { itemId: newItem.id, productId: newItem.productId, quantity }
  });
  
  await addEvent({
    userId: USER_ID,
    type: 'PRICING_CALCULATED',
    source: 'api',
    payload: { pricing: cart.pricing }
  });

  return NextResponse.json(cart);
}
