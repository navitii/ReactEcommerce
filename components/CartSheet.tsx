'use client';

import { Cart } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CartSheetProps {
  cart: Cart | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
}

export default function CartSheet({ cart, isOpen, onClose, onRemoveItem }: CartSheetProps) {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/orders/${data.orderId}`);
      } else {
        alert('Failed to place order');
      }
    } catch (e) {
      console.error(e);
      alert('Error placing order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Your cart is empty</div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-medium">{item.productName} <span className="text-gray-500 text-sm">x{item.quantity}</span></h3>
                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    {item.modifiers.map((mod, idx) => (
                      <div key={idx}>+ {mod.name}</div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium">{formatCurrency(item.totalPriceCents)}</span>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="p-6 bg-gray-50 border-t space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.pricing.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>{formatCurrency(cart.pricing.taxCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Fee</span>
              <span>{formatCurrency(cart.pricing.serviceFeeCents)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(cart.pricing.totalCents)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-black text-white py-3 rounded-lg font-bold mt-4 hover:bg-gray-800 disabled:opacity-50"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
