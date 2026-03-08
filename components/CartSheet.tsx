'use client';

import { Cart, CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CartSheetProps {
  cart: Cart | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
}

export default function CartSheet({ cart, isOpen, onClose, onRemoveItem, onEditItem }: CartSheetProps) {
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

  console.log(cart?.items);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"  style={{backgroundColor: "#F6EFE3"}}>
        {isCheckingOut && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-l-lg" style={{backgroundColor: "rgba(246, 239, 227, 0.7)"}}>
            <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#AF1D1D" }} />
            <span className="mt-4 font-bold text-lg" style={{ color: "#AF1D1D" }}>Preparing your order...</span>
          </div>
        )}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button onClick={onClose} disabled={isCheckingOut} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Your cart is empty</div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b pb-4">
                <div style={{display: "flex", alignItems: 'center', gap: '20px'}}>
                  <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 className="font-medium">{item.productName} <span className="text-gray-500 text-sm">x{item.quantity}</span></h3>
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      {item.modifiers.map((mod, idx) => (
                        <div key={idx}>+ {mod.name}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span style={{backgroundColor: "#FABF0D", color: "#AF1D1D", width: "80px", textAlign: "center", padding: "3px", borderRadius: "5px"}} className="font-medium">{formatCurrency(item.totalPriceCents)}</span>
                  <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        onClose();
                        onEditItem(item);
                      }}
                      className="text-gray-600 hover:bg-gray-100 p-1 rounded cursor-pointer" 
                      title="Edit item"
                    >
                      <Pencil size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="p-6 bg-gray-50 border-t space-y-3"  style={{backgroundColor: "#F6EFE3"}}>
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
              <span style={{backgroundColor: "#FABF0D", color: "#AF1D1D", width: "80px", textAlign: "center", padding: "3px", borderRadius: "5px"}}>{formatCurrency(cart.pricing.totalCents)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-black text-white py-3 rounded-lg font-bold mt-4 hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center gap-2"
              style={{ backgroundColor: "#FABF0D" , color: "black", cursor: "pointer"}}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
