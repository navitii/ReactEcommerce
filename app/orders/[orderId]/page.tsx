'use client';

import { useEffect, useState, useCallback } from 'react';
import { Order, TimelineEvent } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Timeline from '@/components/Timeline';
import { useParams } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, eventsRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch(`/api/orders/${orderId}/timeline`)
      ]);
      
      if (orderRes.ok) setOrder(await orderRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!order && loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return <div className="p-10 text-center text-red-500">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-black">
            <ArrowLeft size={20} className="mr-2" /> Back to Menu
          </Link>
          <button onClick={fetchData} className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Status</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x {item.productName}</span>
                      {item.modifiers.length > 0 && (
                        <div className="text-gray-500 text-xs pl-4">
                          {item.modifiers.map(m => m.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <span>{formatCurrency(item.totalPriceCents)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg h-fit">
              <h3 className="font-semibold mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.pricing.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(order.pricing.taxCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span>{formatCurrency(order.pricing.serviceFeeCents)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(order.pricing.totalCents)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Timeline events={events} />
      </div>
    </div>
  );
}
