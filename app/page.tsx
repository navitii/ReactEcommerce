'use client';

import { useEffect, useState } from 'react';
import { Product, Cart } from '@/types';
import { formatCurrency } from '@/lib/utils';
import ProductModal from '@/components/ProductModal';
import CartSheet from '@/components/CartSheet';
import { ShoppingBag } from 'lucide-react';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = () => {
    fetch('/api/cart').then(res => res.json()).then(setCart);
  };

  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(setProducts);
    fetchCart();
  }, []);

  const addToCart = async (product: Product, modifiers: { groupId: string; optionId: string }[], quantity: number) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, modifiers, quantity }),
    });
    fetchCart();
    setIsCartOpen(true);
  };

  const removeFromCart = async (itemId: string) => {
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
    fetchCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">BurgerJoint</h1>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <ShoppingBag />
            {cart && cart.items.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="h-48 overflow-hidden">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                    {formatCurrency(product.basePriceCents)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart}
      />

      <CartSheet 
        cart={cart} 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}
