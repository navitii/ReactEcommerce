import { TimelineEvent } from '@/types';
import { format } from 'date-fns';
import { CheckCircle, ShoppingCart, CreditCard, AlertCircle, Clock, FileText } from 'lucide-react';

const EventIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'CART_ITEM_ADDED': return <ShoppingCart className="text-blue-500" size={18} />;
    case 'CART_ITEM_REMOVED': return <ShoppingCart className="text-red-500" size={18} />;
    case 'ORDER_PLACED': return <CheckCircle className="text-green-500" size={18} />;
    case 'ORDER_STATUS_CHANGED': return <Clock className="text-orange-500" size={18} />;
    case 'PRICING_CALCULATED': return <CreditCard className="text-gray-500" size={18} />;
    default: return <FileText className="text-gray-400" size={18} />;
  }
};

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="border rounded-xl bg-white overflow-hidden" style={{border: '1px solid #AF1D1D'}}>
      <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700" style={{backgroundColor: "#AF1D1D", color: "white"}}>
        Order Timeline
      </div>
      <div className="divide-y">
        {events.map((event) => (
          <div key={event.eventId} className="p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex gap-3">
              <div className="mt-1">
                <EventIcon type={event.type} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-gray-900">{event.type}</span>
                  <span className="text-xs text-gray-400 font-mono">
                    {format(new Date(event.timestamp), 'MMM d, HH:mm:ss.SSS')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded border">Source: {event.source}</span>
                  {event.correlationId && (
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[150px]" title={event.correlationId}>
                      Corr: {event.correlationId}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <details className="group/details">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none list-none flex items-center gap-1">
                      <span>Payload</span>
                      <span className="group-open/details:rotate-180 transition-transform">▼</span>
                    </summary>
                    <pre className="mt-2 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto font-mono">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No events found.</div>
        )}
      </div>
    </div>
  );
}
