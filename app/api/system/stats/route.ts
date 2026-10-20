import { NextResponse } from 'next/server';
import { getAppState, calculateRealMetrics } from '@/lib/server/state';

export async function GET() {
  const state = getAppState();
  const metrics = calculateRealMetrics();

  return NextResponse.json({
    metrics,
    settings: state.settings,
    whatsappStatus: state.whatsapp.status,
  });
}
