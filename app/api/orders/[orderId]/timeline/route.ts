import { NextRequest, NextResponse } from 'next/server';
import { getEventsByOrderId } from '@/lib/repository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const events = await getEventsByOrderId(orderId);

  return NextResponse.json(events);
}
