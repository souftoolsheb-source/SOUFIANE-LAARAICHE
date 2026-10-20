import { NextResponse } from 'next/server';
import { getAppState } from '@/lib/server/state';

export async function GET() {
  const state = getAppState();
  return NextResponse.json({
    session: state.whatsapp,
    serverTime: new Date().toISOString(),
  });
}
